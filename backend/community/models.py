"""
Community Forum Models for Investo.

Replaces the old Discord-style chat system with a structured
Reddit/Quora-style investment discussion forum.

Old models (ChatGroup, Membership, Message) are kept as legacy
but no longer used by the new forum views.
"""
from django.db import models
from django.contrib.auth.models import User
from datetime import datetime


# ─────────────────────────────────────────────────────────────
# LEGACY CHAT MODELS (kept to avoid breaking existing migrations)
# ─────────────────────────────────────────────────────────────

class ChatGroup(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, default="")
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="created_groups")
    is_announcement = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name


class Membership(models.Model):
    ROLE_CHOICES = [("admin", "Admin"), ("member", "Member")]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="memberships")
    group = models.ForeignKey(ChatGroup, on_delete=models.CASCADE, related_name="memberships")
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="member")
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "group")
        ordering = ["-joined_at"]


class Message(models.Model):
    group = models.ForeignKey(ChatGroup, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="chat_messages")
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["timestamp"]
        indexes = [models.Index(fields=["group", "timestamp"])]


# ─────────────────────────────────────────────────────────────
# NEW FORUM MODELS
# ─────────────────────────────────────────────────────────────

class ForumCategory(models.Model):
    """Top-level discussion category (e.g. Stocks, Crypto, Beginner Investing)."""
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=10, default="💬")   # emoji icon
    color = models.CharField(max_length=20, default="#D90A14")  # accent colour
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "name"]
        verbose_name_plural = "Forum Categories"

    def __str__(self):
        return self.name


class ForumPost(models.Model):
    """A discussion post — the main unit of the forum."""
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="forum_posts")
    category = models.ForeignKey(ForumCategory, on_delete=models.CASCADE, related_name="posts")
    title = models.CharField(max_length=300)
    content = models.TextField()
    image = models.TextField(null=True, blank=True)
    tags = models.CharField(max_length=200, blank=True, default="")  # comma-separated


    # Engagement counters (denormalised for fast reads)
    like_count = models.PositiveIntegerField(default=0)
    comment_count = models.PositiveIntegerField(default=0)
    view_count = models.PositiveIntegerField(default=0)
    bookmark_count = models.PositiveIntegerField(default=0)

    is_pinned = models.BooleanField(default=False)
    is_locked = models.BooleanField(default=False)   # admin can lock thread
    is_removed = models.BooleanField(default=False)  # soft-delete by admin

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["category", "-created_at"]),
            models.Index(fields=["-like_count"]),
            models.Index(fields=["-created_at"]),
        ]

    def __str__(self):
        return self.title

    def get_tags_list(self):
        return [t.strip() for t in self.tags.split(",") if t.strip()]


class ForumComment(models.Model):
    """A top-level comment on a ForumPost."""
    post = models.ForeignKey(ForumPost, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="forum_comments")
    content = models.TextField()
    like_count = models.PositiveIntegerField(default=0)
    is_removed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.author.username} on '{self.post.title[:40]}'"


class CommentReply(models.Model):
    """A reply to a ForumComment (one level of nesting)."""
    comment = models.ForeignKey(ForumComment, on_delete=models.CASCADE, related_name="replies")
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="forum_replies")
    content = models.TextField()
    like_count = models.PositiveIntegerField(default=0)
    is_removed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.author.username} reply to comment {self.comment_id}"


class PostLike(models.Model):
    """Tracks which users liked which posts (prevents double-liking)."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="post_likes")
    post = models.ForeignKey(ForumPost, on_delete=models.CASCADE, related_name="likes")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "post")


class CommentLike(models.Model):
    """Tracks comment likes."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="comment_likes")
    comment = models.ForeignKey(ForumComment, on_delete=models.CASCADE, related_name="liked_by")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "comment")


class Bookmark(models.Model):
    """User bookmarks a post for later reading."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bookmarks")
    post = models.ForeignKey(ForumPost, on_delete=models.CASCADE, related_name="bookmarked_by")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "post")
        ordering = ["-created_at"]


class ReportedContent(models.Model):
    """Users can report posts or comments for admin review."""
    REASON_CHOICES = [
        ("spam", "Spam"),
        ("misinformation", "Misinformation"),
        ("harassment", "Harassment"),
        ("inappropriate", "Inappropriate Content"),
        ("other", "Other"),
    ]
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("reviewed", "Reviewed"),
        ("actioned", "Actioned"),
        ("dismissed", "Dismissed"),
    ]

    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reports_filed")
    post = models.ForeignKey(ForumPost, on_delete=models.SET_NULL, null=True, blank=True, related_name="reports")
    comment = models.ForeignKey(ForumComment, on_delete=models.SET_NULL, null=True, blank=True, related_name="reports")
    reason = models.CharField(max_length=20, choices=REASON_CHOICES, default="other")
    details = models.TextField(blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="reports_reviewed"
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        target = f"post:{self.post_id}" if self.post_id else f"comment:{self.comment_id}"
        return f"Report by {self.reporter.username} on {target}"
