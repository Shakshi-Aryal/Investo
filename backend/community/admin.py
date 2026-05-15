from django.contrib import admin
from .models import ForumCategory, ForumPost, ForumComment, CommentReply, ReportedContent


@admin.register(ForumCategory)
class ForumCategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "icon", "order", "is_active", "post_count"]
    prepopulated_fields = {"slug": ("name",)}
    list_editable = ["order", "is_active"]

    def post_count(self, obj):
        return obj.posts.filter(is_removed=False).count()


@admin.register(ForumPost)
class ForumPostAdmin(admin.ModelAdmin):
    list_display = ["title", "author", "category", "like_count", "comment_count", "is_pinned", "is_locked", "is_removed", "created_at"]
    list_filter = ["category", "is_pinned", "is_locked", "is_removed"]
    search_fields = ["title", "content", "author__username"]
    actions = ["pin_posts", "unpin_posts", "lock_posts", "remove_posts"]

    def pin_posts(self, request, queryset):
        queryset.update(is_pinned=True)
    pin_posts.short_description = "Pin selected posts"

    def unpin_posts(self, request, queryset):
        queryset.update(is_pinned=False)
    unpin_posts.short_description = "Unpin selected posts"

    def lock_posts(self, request, queryset):
        queryset.update(is_locked=True)
    lock_posts.short_description = "Lock selected posts"

    def remove_posts(self, request, queryset):
        queryset.update(is_removed=True)
    remove_posts.short_description = "Remove selected posts"


@admin.register(ForumComment)
class ForumCommentAdmin(admin.ModelAdmin):
    list_display = ["author", "post", "like_count", "is_removed", "created_at"]
    list_filter = ["is_removed"]
    search_fields = ["content", "author__username"]


@admin.register(ReportedContent)
class ReportedContentAdmin(admin.ModelAdmin):
    list_display = ["reporter", "reason", "status", "post", "comment", "created_at"]
    list_filter = ["status", "reason"]
    list_editable = ["status"]
