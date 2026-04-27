from rest_framework import serializers
from django.contrib.auth.models import User
from .models import ChatGroup, Membership, Message


class UserMiniSerializer(serializers.ModelSerializer):
    """Minimal user info for chat display."""
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name"]


class ChatGroupSerializer(serializers.ModelSerializer):
    creator_name = serializers.CharField(source="creator.username", read_only=True)
    member_count = serializers.SerializerMethodField()
    is_member = serializers.SerializerMethodField()

    class Meta:
        model = ChatGroup
        fields = [
            "id", "name", "description", "creator", "creator_name",
            "is_announcement", "created_at", "member_count", "is_member",
        ]
        read_only_fields = ["creator", "created_at"]

    def get_member_count(self, obj):
        return obj.memberships.count()

    def get_is_member(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.memberships.filter(user=request.user).exists()
        return False


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source="sender.username", read_only=True)

    class Meta:
        model = Message
        fields = ["id", "group", "sender", "sender_name", "content", "timestamp"]
        read_only_fields = ["sender", "group", "timestamp"]


class MembershipSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Membership
        fields = ["id", "user", "username", "group", "role", "joined_at"]
        read_only_fields = ["user", "group", "joined_at"]
