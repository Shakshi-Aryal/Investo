from django.db import models
from django.contrib.auth.models import User


class ChatGroup(models.Model):
    """A chat group / community channel."""
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
    """Tracks which users belong to which groups."""
    ROLE_CHOICES = [
        ("admin", "Admin"),
        ("member", "Member"),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="memberships")
    group = models.ForeignKey(ChatGroup, on_delete=models.CASCADE, related_name="memberships")
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="member")
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "group")
        ordering = ["-joined_at"]

    def __str__(self):
        return f"{self.user.username} in {self.group.name}"


class Message(models.Model):
    """A single chat message in a group."""
    group = models.ForeignKey(ChatGroup, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="chat_messages")
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["timestamp"]
        indexes = [
            models.Index(fields=["group", "timestamp"]),
        ]

    def __str__(self):
        return f"{self.sender.username}: {self.content[:50]}"
