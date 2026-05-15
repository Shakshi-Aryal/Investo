"""
Unified Notification System Models.
Handles all notification types: alerts, reminders, system, market events.
"""
from django.db import models
from django.contrib.auth.models import User
from datetime import datetime


class Notification(models.Model):
    """
    Unified notification model for all notification types.
    Supports in-app display, email sending, and real-time WebSocket delivery.
    """

    TYPE_CHOICES = [
        ('alert', 'Price Alert'),
        ('reminder', 'Reminder'),
        ('system', 'System'),
        ('market', 'Market Event'),
        ('watchlist', 'Watchlist Update'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='system')
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    is_email_sent = models.BooleanField(default=False)

    # Optional JSON metadata for extra context (stock symbol, alert details, etc.)
    metadata = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read', '-created_at']),
        ]

    def __str__(self):
        return f"[{self.notification_type}] {self.title} → {self.user.username}"

    def mark_read(self):
        """Mark notification as read. Compatible with USE_TZ=False."""
        if not self.is_read:
            self.is_read = True
            self.read_at = datetime.now()
            self.save(update_fields=['is_read', 'read_at'])
