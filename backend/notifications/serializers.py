"""
Serializers for the Notification system.
"""
from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    """Full notification serializer."""
    class Meta:
        model = Notification
        fields = [
            'id', 'notification_type', 'title', 'message',
            'is_read', 'is_email_sent', 'metadata',
            'created_at', 'read_at',
        ]
        read_only_fields = ['id', 'created_at']
