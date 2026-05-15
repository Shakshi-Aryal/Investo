"""
Migration: Add forum system models to the community app.
The old ChatGroup/Membership/Message models are preserved (not dropped)
to avoid breaking the existing migration history.
"""
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("community", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # ── ForumCategory ──────────────────────────────────────────────────
        migrations.CreateModel(
            name="ForumCategory",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=100, unique=True)),
                ("slug", models.SlugField(max_length=100, unique=True)),
                ("description", models.TextField(blank=True)),
                ("icon", models.CharField(default="💬", max_length=10)),
                ("color", models.CharField(default="#D90A14", max_length=20)),
                ("order", models.PositiveIntegerField(default=0)),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={"ordering": ["order", "name"], "verbose_name_plural": "Forum Categories"},
        ),

        # ── ForumPost ──────────────────────────────────────────────────────
        migrations.CreateModel(
            name="ForumPost",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=300)),
                ("content", models.TextField()),
                ("tags", models.CharField(blank=True, default="", max_length=200)),
                ("like_count", models.PositiveIntegerField(default=0)),
                ("comment_count", models.PositiveIntegerField(default=0)),
                ("view_count", models.PositiveIntegerField(default=0)),
                ("bookmark_count", models.PositiveIntegerField(default=0)),
                ("is_pinned", models.BooleanField(default=False)),
                ("is_locked", models.BooleanField(default=False)),
                ("is_removed", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("author", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="forum_posts", to=settings.AUTH_USER_MODEL)),
                ("category", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="posts", to="community.forumcategory")),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.AddIndex(
            model_name="forumpost",
            index=models.Index(fields=["category", "-created_at"], name="community_fp_cat_idx"),
        ),
        migrations.AddIndex(
            model_name="forumpost",
            index=models.Index(fields=["-like_count"], name="community_fp_like_idx"),
        ),
        migrations.AddIndex(
            model_name="forumpost",
            index=models.Index(fields=["-created_at"], name="community_fp_date_idx"),
        ),

        # ── ForumComment ───────────────────────────────────────────────────
        migrations.CreateModel(
            name="ForumComment",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("content", models.TextField()),
                ("like_count", models.PositiveIntegerField(default=0)),
                ("is_removed", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("author", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="forum_comments", to=settings.AUTH_USER_MODEL)),
                ("post", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="comments", to="community.forumpost")),
            ],
            options={"ordering": ["created_at"]},
        ),

        # ── CommentReply ───────────────────────────────────────────────────
        migrations.CreateModel(
            name="CommentReply",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("content", models.TextField()),
                ("like_count", models.PositiveIntegerField(default=0)),
                ("is_removed", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("author", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="forum_replies", to=settings.AUTH_USER_MODEL)),
                ("comment", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="replies", to="community.forumcomment")),
            ],
            options={"ordering": ["created_at"]},
        ),

        # ── PostLike ───────────────────────────────────────────────────────
        migrations.CreateModel(
            name="PostLike",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("post", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="likes", to="community.forumpost")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="post_likes", to=settings.AUTH_USER_MODEL)),
            ],
            options={"unique_together": {("user", "post")}},
        ),

        # ── CommentLike ────────────────────────────────────────────────────
        migrations.CreateModel(
            name="CommentLike",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("comment", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="liked_by", to="community.forumcomment")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="comment_likes", to=settings.AUTH_USER_MODEL)),
            ],
            options={"unique_together": {("user", "comment")}},
        ),

        # ── Bookmark ───────────────────────────────────────────────────────
        migrations.CreateModel(
            name="Bookmark",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("post", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="bookmarked_by", to="community.forumpost")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="bookmarks", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["-created_at"], "unique_together": {("user", "post")}},
        ),

        # ── ReportedContent ────────────────────────────────────────────────
        migrations.CreateModel(
            name="ReportedContent",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("reason", models.CharField(choices=[("spam", "Spam"), ("misinformation", "Misinformation"), ("harassment", "Harassment"), ("inappropriate", "Inappropriate Content"), ("other", "Other")], default="other", max_length=20)),
                ("details", models.TextField(blank=True)),
                ("status", models.CharField(choices=[("pending", "Pending"), ("reviewed", "Reviewed"), ("actioned", "Actioned"), ("dismissed", "Dismissed")], default="pending", max_length=10)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("reviewed_at", models.DateTimeField(blank=True, null=True)),
                ("comment", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="reports", to="community.forumcomment")),
                ("post", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="reports", to="community.forumpost")),
                ("reporter", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="reports_filed", to=settings.AUTH_USER_MODEL)),
                ("reviewed_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="reports_reviewed", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["-created_at"]},
        ),
    ]
