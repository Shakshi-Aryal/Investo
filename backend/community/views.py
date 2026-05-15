"""
Community Forum API Views for Investo.

Endpoints follow REST conventions and are paginated.
All write operations require JWT authentication.
Read operations (list, detail) are public.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q, F
from django.utils.text import slugify
from datetime import datetime

from .models import (
    ForumCategory, ForumPost, ForumComment, CommentReply,
    PostLike, CommentLike, Bookmark, ReportedContent,
)
from .serializers import (
    ForumCategorySerializer, ForumPostListSerializer, ForumPostDetailSerializer,
    ForumPostCreateSerializer, ForumCommentSerializer, CommentReplySerializer,
    ReportSerializer,
)


# ─────────────────────────────────────────────────────────────
# PAGINATION
# ─────────────────────────────────────────────────────────────

class ForumPagination(PageNumberPagination):
    page_size = 15
    page_size_query_param = "page_size"
    max_page_size = 50


# ─────────────────────────────────────────────────────────────
# CATEGORIES
# ─────────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([AllowAny])
def category_list(request):
    """List all active forum categories with post counts."""
    cats = ForumCategory.objects.filter(is_active=True)
    return Response(ForumCategorySerializer(cats, many=True).data)


# ─────────────────────────────────────────────────────────────
# POSTS — LIST & CREATE
# ─────────────────────────────────────────────────────────────

@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def post_list_create(request):
    """
    GET  — paginated post feed with search/filter/sort
    POST — create a new post (auth required)
    """
    if request.method == "GET":
        posts = ForumPost.objects.filter(is_removed=False).select_related(
            "author", "category"
        ).prefetch_related("likes", "bookmarked_by")

        # Filter by category slug
        category = request.query_params.get("category", "")
        if category:
            posts = posts.filter(category__slug=category)

        # Search title + content
        search = request.query_params.get("search", "")
        if search:
            posts = posts.filter(
                Q(title__icontains=search) | Q(content__icontains=search) | Q(tags__icontains=search)
            )

        # Sort
        sort = request.query_params.get("sort", "newest")
        sort_map = {
            "newest":   "-created_at",
            "oldest":   "created_at",
            "trending": "-like_count",
            "popular":  "-comment_count",
            "views":    "-view_count",
        }
        posts = posts.order_by("-is_pinned", sort_map.get(sort, "-created_at"))

        paginator = ForumPagination()
        page = paginator.paginate_queryset(posts, request)
        serializer = ForumPostListSerializer(page, many=True, context={"request": request})
        return paginator.get_paginated_response(serializer.data)

    # POST — create
    if not request.user.is_authenticated:
        return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

    serializer = ForumPostCreateSerializer(data=request.data)
    if serializer.is_valid():
        post = serializer.save(author=request.user)
        return Response(
            ForumPostDetailSerializer(post, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────────────────────
# POSTS — DETAIL, UPDATE, DELETE
# ─────────────────────────────────────────────────────────────

@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([AllowAny])
def post_detail(request, post_id):
    """
    GET    — post detail + comments (increments view count)
    PUT    — update own post (auth required)
    DELETE — soft-delete own post or admin hard-delete (auth required)
    """
    try:
        post = ForumPost.objects.get(id=post_id, is_removed=False)
    except ForumPost.DoesNotExist:
        return Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        # Increment view count atomically
        ForumPost.objects.filter(id=post_id).update(view_count=F("view_count") + 1)
        post.refresh_from_db()
        serializer = ForumPostDetailSerializer(post, context={"request": request})
        return Response(serializer.data)

    # Write operations require auth
    if not request.user.is_authenticated:
        return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

    if request.method in ("PUT", "PATCH"):
        if post.author != request.user and not request.user.is_staff:
            return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        serializer = ForumPostCreateSerializer(post, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(ForumPostDetailSerializer(post, context={"request": request}).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == "DELETE":
        if post.author != request.user and not request.user.is_staff:
            return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        post.is_removed = True
        post.save(update_fields=["is_removed"])
        return Response({"status": "deleted"})


# ─────────────────────────────────────────────────────────────
# LIKE / UNLIKE POST
# ─────────────────────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def toggle_post_like(request, post_id):
    """Toggle like on a post. Returns new like count and liked state."""
    try:
        post = ForumPost.objects.get(id=post_id, is_removed=False)
    except ForumPost.DoesNotExist:
        return Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)

    like, created = PostLike.objects.get_or_create(user=request.user, post=post)
    if not created:
        like.delete()
        ForumPost.objects.filter(id=post_id).update(like_count=F("like_count") - 1)
        post.refresh_from_db()
        return Response({"liked": False, "like_count": post.like_count})

    ForumPost.objects.filter(id=post_id).update(like_count=F("like_count") + 1)
    post.refresh_from_db()
    return Response({"liked": True, "like_count": post.like_count})


# ─────────────────────────────────────────────────────────────
# BOOKMARK / UNBOOKMARK POST
# ─────────────────────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def toggle_bookmark(request, post_id):
    """Toggle bookmark on a post."""
    try:
        post = ForumPost.objects.get(id=post_id, is_removed=False)
    except ForumPost.DoesNotExist:
        return Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)

    bm, created = Bookmark.objects.get_or_create(user=request.user, post=post)
    if not created:
        bm.delete()
        ForumPost.objects.filter(id=post_id).update(bookmark_count=F("bookmark_count") - 1)
        return Response({"bookmarked": False})

    ForumPost.objects.filter(id=post_id).update(bookmark_count=F("bookmark_count") + 1)
    return Response({"bookmarked": True})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_bookmarks(request):
    """Return the current user's bookmarked posts."""
    bms = Bookmark.objects.filter(user=request.user).select_related("post__author", "post__category")
    posts = [bm.post for bm in bms if not bm.post.is_removed]
    serializer = ForumPostListSerializer(posts, many=True, context={"request": request})
    return Response(serializer.data)


# ─────────────────────────────────────────────────────────────
# COMMENTS
# ─────────────────────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_comment(request, post_id):
    """Add a comment to a post."""
    try:
        post = ForumPost.objects.get(id=post_id, is_removed=False)
    except ForumPost.DoesNotExist:
        return Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)

    if post.is_locked:
        return Response({"error": "This thread is locked"}, status=status.HTTP_403_FORBIDDEN)

    content = request.data.get("content", "").strip()
    if not content:
        return Response({"error": "Content is required"}, status=status.HTTP_400_BAD_REQUEST)

    comment = ForumComment.objects.create(post=post, author=request.user, content=content)
    ForumPost.objects.filter(id=post_id).update(comment_count=F("comment_count") + 1)

    return Response(
        ForumCommentSerializer(comment, context={"request": request}).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(["PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def comment_detail(request, comment_id):
    """Edit or soft-delete a comment."""
    try:
        comment = ForumComment.objects.get(id=comment_id, is_removed=False)
    except ForumComment.DoesNotExist:
        return Response({"error": "Comment not found"}, status=status.HTTP_404_NOT_FOUND)

    if comment.author != request.user and not request.user.is_staff:
        return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

    if request.method == "PUT":
        content = request.data.get("content", "").strip()
        if not content:
            return Response({"error": "Content required"}, status=status.HTTP_400_BAD_REQUEST)
        comment.content = content
        comment.save(update_fields=["content", "updated_at"])
        return Response(ForumCommentSerializer(comment, context={"request": request}).data)

    if request.method == "DELETE":
        comment.is_removed = True
        comment.save(update_fields=["is_removed"])
        ForumPost.objects.filter(id=comment.post_id).update(
            comment_count=F("comment_count") - 1
        )
        return Response({"status": "deleted"})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def toggle_comment_like(request, comment_id):
    """Toggle like on a comment."""
    try:
        comment = ForumComment.objects.get(id=comment_id, is_removed=False)
    except ForumComment.DoesNotExist:
        return Response({"error": "Comment not found"}, status=status.HTTP_404_NOT_FOUND)

    like, created = CommentLike.objects.get_or_create(user=request.user, comment=comment)
    if not created:
        like.delete()
        ForumComment.objects.filter(id=comment_id).update(like_count=F("like_count") - 1)
        comment.refresh_from_db()
        return Response({"liked": False, "like_count": comment.like_count})

    ForumComment.objects.filter(id=comment_id).update(like_count=F("like_count") + 1)
    comment.refresh_from_db()
    return Response({"liked": True, "like_count": comment.like_count})


# ─────────────────────────────────────────────────────────────
# REPLIES
# ─────────────────────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_reply(request, comment_id):
    """Add a reply to a comment."""
    try:
        comment = ForumComment.objects.get(id=comment_id, is_removed=False)
    except ForumComment.DoesNotExist:
        return Response({"error": "Comment not found"}, status=status.HTTP_404_NOT_FOUND)

    content = request.data.get("content", "").strip()
    if not content:
        return Response({"error": "Content is required"}, status=status.HTTP_400_BAD_REQUEST)

    reply = CommentReply.objects.create(comment=comment, author=request.user, content=content)
    return Response(
        CommentReplySerializer(reply, context={"request": request}).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(["PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def reply_detail(request, reply_id):
    """Edit or delete a reply."""
    try:
        reply = CommentReply.objects.get(id=reply_id, is_removed=False)
    except CommentReply.DoesNotExist:
        return Response({"error": "Reply not found"}, status=status.HTTP_404_NOT_FOUND)

    if reply.author != request.user and not request.user.is_staff:
        return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

    if request.method == "PUT":
        content = request.data.get("content", "").strip()
        if not content:
            return Response({"error": "Content required"}, status=status.HTTP_400_BAD_REQUEST)
        reply.content = content
        reply.save(update_fields=["content", "updated_at"])
        return Response(CommentReplySerializer(reply, context={"request": request}).data)

    reply.is_removed = True
    reply.save(update_fields=["is_removed"])
    return Response({"status": "deleted"})


# ─────────────────────────────────────────────────────────────
# REPORT CONTENT
# ─────────────────────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def report_content(request):
    """Report a post or comment for moderation."""
    serializer = ReportSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(reporter=request.user)
        return Response({"status": "reported"}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────────────────────
# TRENDING / SIDEBAR DATA
# ─────────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([AllowAny])
def trending_posts(request):
    """Top 5 posts by likes in the last 7 days."""
    from datetime import timedelta
    cutoff = datetime.now() - timedelta(days=7)
    posts = ForumPost.objects.filter(
        is_removed=False, created_at__gte=cutoff
    ).order_by("-like_count", "-comment_count")[:5]
    return Response(ForumPostListSerializer(posts, many=True, context={"request": request}).data)


@api_view(["GET"])
@permission_classes([AllowAny])
def top_contributors(request):
    """Top 5 users by post count."""
    from django.contrib.auth.models import User
    from django.db.models import Count
    users = User.objects.annotate(
        posts=Count("forum_posts", filter=Q(forum_posts__is_removed=False))
    ).order_by("-posts")[:5]
    data = [
        {
            "id": u.id,
            "username": u.username,
            "first_name": u.first_name,
            "posts": u.posts,
        }
        for u in users
    ]
    return Response(data)


# ─────────────────────────────────────────────────────────────
# ADMIN MODERATION
# ─────────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_reports(request):
    """List pending reports (staff only)."""
    if not request.user.is_staff:
        return Response({"error": "Staff only"}, status=status.HTTP_403_FORBIDDEN)
    reports = ReportedContent.objects.filter(status="pending").select_related(
        "reporter", "post", "comment"
    )
    return Response(ReportSerializer(reports, many=True).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def admin_pin_post(request, post_id):
    """Toggle pin on a post (staff only)."""
    if not request.user.is_staff:
        return Response({"error": "Staff only"}, status=status.HTTP_403_FORBIDDEN)
    try:
        post = ForumPost.objects.get(id=post_id)
    except ForumPost.DoesNotExist:
        return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)
    post.is_pinned = not post.is_pinned
    post.save(update_fields=["is_pinned"])
    return Response({"is_pinned": post.is_pinned})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def admin_lock_post(request, post_id):
    """Toggle lock on a post (staff only)."""
    if not request.user.is_staff:
        return Response({"error": "Staff only"}, status=status.HTTP_403_FORBIDDEN)
    try:
        post = ForumPost.objects.get(id=post_id)
    except ForumPost.DoesNotExist:
        return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)
    post.is_locked = not post.is_locked
    post.save(update_fields=["is_locked"])
    return Response({"is_locked": post.is_locked})


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def admin_remove_post(request, post_id):
    """Hard-remove a post (staff only)."""
    if not request.user.is_staff:
        return Response({"error": "Staff only"}, status=status.HTTP_403_FORBIDDEN)
    ForumPost.objects.filter(id=post_id).update(is_removed=True)
    return Response({"status": "removed"})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def admin_create_category(request):
    """Create a new forum category (staff only)."""
    if not request.user.is_staff:
        return Response({"error": "Staff only"}, status=status.HTTP_403_FORBIDDEN)
    name = request.data.get("name", "").strip()
    if not name:
        return Response({"error": "Name required"}, status=status.HTTP_400_BAD_REQUEST)
    slug = slugify(name)
    cat, created = ForumCategory.objects.get_or_create(
        slug=slug,
        defaults={
            "name": name,
            "description": request.data.get("description", ""),
            "icon": request.data.get("icon", "💬"),
            "color": request.data.get("color", "#D90A14"),
        },
    )
    return Response(ForumCategorySerializer(cat).data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


# ─────────────────────────────────────────────────────────────
# USER PROFILE (community stats)
# ─────────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([AllowAny])
def user_profile(request, username):
    """Public community profile for a user."""
    from django.contrib.auth.models import User
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    posts = ForumPost.objects.filter(author=user, is_removed=False).order_by("-created_at")[:10]
    return Response({
        "id": user.id,
        "username": user.username,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "post_count": ForumPost.objects.filter(author=user, is_removed=False).count(),
        "comment_count": ForumComment.objects.filter(author=user, is_removed=False).count(),
        "recent_posts": ForumPostListSerializer(posts, many=True, context={"request": request}).data,
    })
