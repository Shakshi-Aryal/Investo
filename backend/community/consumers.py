import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import AccessToken
from .models import ChatGroup, Membership, Message


class ChatConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time group chat."""

    async def connect(self):
        self.group_id = self.scope["url_route"]["kwargs"]["group_id"]
        self.room_group_name = f"chat_{self.group_id}"

        # Authenticate via JWT token in query string
        query_string = self.scope.get("query_string", b"").decode()
        params = dict(p.split("=", 1) for p in query_string.split("&") if "=" in p)
        token = params.get("token", "")

        self.user = await self.get_user_from_token(token)
        if self.user is None:
            await self.close()
            return

        # Verify membership
        is_member = await self.check_membership(self.user, self.group_id)
        if not is_member:
            await self.close()
            return

        # Join channel group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        # Send join notification
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "user_event",
                "event": "joined",
                "username": self.user.username,
            },
        )

    async def disconnect(self, close_code):
        if hasattr(self, "room_group_name"):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_content = data.get("message", "").strip()

        if not message_content:
            return

        # Check if announcement channel — only admins can post
        is_announcement = await self.is_announcement_group(self.group_id)
        if is_announcement:
            is_admin = await self.is_group_admin(self.user, self.group_id)
            if not is_admin:
                await self.send(text_data=json.dumps({
                    "type": "error",
                    "message": "Only admins can post in announcement channels.",
                }))
                return

        # Save message to DB
        saved_msg = await self.save_message(self.user, self.group_id, message_content)

        # Broadcast to group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "id": saved_msg.id,
                "message": saved_msg.content,
                "sender": self.user.username,
                "sender_id": self.user.id,
                "timestamp": saved_msg.timestamp.isoformat(),
            },
        )

    # ── Handler for chat messages ──
    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            "type": "message",
            "id": event["id"],
            "message": event["message"],
            "sender": event["sender"],
            "sender_id": event["sender_id"],
            "timestamp": event["timestamp"],
        }))

    # ── Handler for user events (join/leave) ──
    async def user_event(self, event):
        await self.send(text_data=json.dumps({
            "type": "user_event",
            "event": event["event"],
            "username": event["username"],
        }))

    # ── Database helpers ──
    @database_sync_to_async
    def get_user_from_token(self, token):
        try:
            access_token = AccessToken(token)
            user_id = access_token["user_id"]
            return User.objects.get(id=user_id)
        except Exception:
            return None

    @database_sync_to_async
    def check_membership(self, user, group_id):
        if user.is_staff:
            return True
        return Membership.objects.filter(user=user, group_id=group_id).exists()

    @database_sync_to_async
    def save_message(self, user, group_id, content):
        return Message.objects.create(
            group_id=group_id, sender=user, content=content
        )

    @database_sync_to_async
    def is_announcement_group(self, group_id):
        try:
            return ChatGroup.objects.get(id=group_id).is_announcement
        except ChatGroup.DoesNotExist:
            return False

    @database_sync_to_async
    def is_group_admin(self, user, group_id):
        if user.is_staff:
            return True
        return Membership.objects.filter(
            user=user, group_id=group_id, role="admin"
        ).exists()
