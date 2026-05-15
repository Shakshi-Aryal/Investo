"""
Serializers for the Investo Community Forum.
"""
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    ForumCategory, ForumPost, ForumComment, CommentReply,
    PostLike, CommentLike, Bookmark, ReportedContent,
)


class AuthorSerializer(serializers.ModelSerializer):
    """Compact author info shown on posts/comments."""
    post_count = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "post_count", "avatar"]

    def get_post_count(self, obj):
        return obj.forum_posts.filter(is_removed=False).count()

    def get_avatar(self, obj):
        try:
            return obj.profile.avatar
        except Exception:
            return None



class ForumCategorySerializer(serializers.ModelSerializer):
    post_count = serializers.SerializerMethodField()

    class Meta:
        model = ForumCategory
        fields = ["id", "name", "slug", "description", "icon", "color", "order", "post_count"]

    def get_post_count(self, obj):
        return obj.posts.filter(is_removed=False).count()


class CommentReplySerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    is_mine = serializers.SerializerMethodField()

    class Meta:
        model = CommentReply
        fields = ["id", "comment", "author", "content", "like_count", "is_removed", "created_at", "updated_at", "is_mine"]
        read_only_fields = ["author", "like_count", "is_removed", "created_at", "updated_at"]

    def get_is_mine(self, obj):
        request = self.context.get("request")
        return request and request.user.is_authenticated and obj.author == request.user


class ForumCommentSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    replies = CommentReplySerializer(many=True, read_only=True)
    is_mine = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = ForumComment
        fields = [
            "id", "post", "author", "content", "like_count",
            "is_removed", "created_at", "updated_at",
            "replies", "is_mine", "is_liked",
        ]
        read_only_fields = ["author", "like_count", "is_removed", "created_at", "updated_at"]

    def get_is_mine(self, obj):
        request = self.context.get("request")
        return request and request.user.is_authenticated and obj.author == request.user

    def get_is_liked(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.liked_by.filter(user=request.user).exists()
        return False


class ForumPostListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for feed/list views."""
    author = AuthorSerializer(read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)
    category_slug = serializers.CharField(source="category.slug", read_only=True)
    category_icon = serializers.CharField(source="category.icon", read_only=True)
    tags_list = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    is_bookmarked = serializers.SerializerMethodField()

    class Meta:
        model = ForumPost
        fields = [
            "id", "title", "content", "image", "author",
            "category", "category_name", "category_slug", "category_icon",
            "tags", "tags_list",
            "like_count", "comment_count", "view_count", "bookmark_count",
            "is_pinned", "is_locked",
            "created_at", "updated_at",
            "is_liked", "is_bookmarked",
        ]


    def get_tags_list(self, obj):
        return obj.get_tags_list()

    def get_is_liked(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False

    def get_is_bookmarked(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.bookmarked_by.filter(user=request.user).exists()
        return False


class ForumPostDetailSerializer(ForumPostListSerializer):
    """Full serializer including comments for the detail view."""
    comments = serializers.SerializerMethodField()

    class Meta(ForumPostListSerializer.Meta):
        fields = ForumPostListSerializer.Meta.fields + ["comments"]

    def get_comments(self, obj):
        # Only return non-removed comments
        qs = obj.comments.filter(is_removed=False).prefetch_related("replies", "author")
        return ForumCommentSerializer(qs, many=True, context=self.context).data


class ForumPostCreateSerializer(serializers.ModelSerializer):
    """Used for creating/updating posts."""
    class Meta:
        model = ForumPost
        fields = ["id", "title", "content", "category", "tags", "image"]



class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportedContent
        fields = ["id", "post", "comment", "reason", "details", "status", "created_at"]
        read_only_fields = ["status", "created_at"]
