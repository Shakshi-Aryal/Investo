"""
URL patterns for the Investo Community Forum.
All prefixed with /api/community/ in the root urls.py
"""
from django.urls import path
from . import views

urlpatterns = [
    # ── Categories ──────────────────────────────────────────
    path("categories/", views.category_list, name="forum-categories"),

    # ── Posts ───────────────────────────────────────────────
    path("posts/", views.post_list_create, name="forum-posts"),
    path("posts/<int:post_id>/", views.post_detail, name="forum-post-detail"),
    path("posts/<int:post_id>/like/", views.toggle_post_like, name="forum-post-like"),
    path("posts/<int:post_id>/bookmark/", views.toggle_bookmark, name="forum-post-bookmark"),
    path("posts/<int:post_id>/comments/", views.create_comment, name="forum-create-comment"),

    # ── Comments ────────────────────────────────────────────
    path("comments/<int:comment_id>/", views.comment_detail, name="forum-comment-detail"),
    path("comments/<int:comment_id>/like/", views.toggle_comment_like, name="forum-comment-like"),
    path("comments/<int:comment_id>/replies/", views.create_reply, name="forum-create-reply"),

    # ── Replies ─────────────────────────────────────────────
    path("replies/<int:reply_id>/", views.reply_detail, name="forum-reply-detail"),

    # ── Bookmarks ───────────────────────────────────────────
    path("bookmarks/", views.my_bookmarks, name="forum-bookmarks"),

    # ── Sidebar data ────────────────────────────────────────
    path("trending/", views.trending_posts, name="forum-trending"),
    path("contributors/", views.top_contributors, name="forum-contributors"),

    # ── Reports ─────────────────────────────────────────────
    path("report/", views.report_content, name="forum-report"),

    # ── Admin moderation ────────────────────────────────────
    path("admin/reports/", views.admin_reports, name="forum-admin-reports"),
    path("admin/posts/<int:post_id>/pin/", views.admin_pin_post, name="forum-admin-pin"),
    path("admin/posts/<int:post_id>/lock/", views.admin_lock_post, name="forum-admin-lock"),
    path("admin/posts/<int:post_id>/remove/", views.admin_remove_post, name="forum-admin-remove"),
    path("admin/categories/", views.admin_create_category, name="forum-admin-category"),

    # ── User profile ────────────────────────────────────────
    path("profile/<str:username>/", views.user_profile, name="forum-user-profile"),
]
