import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth.models import User

logger = logging.getLogger(__name__)


class NotificationConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time user-specific notifications.
    Group: 'notifications_{user_id}'

    Authentication: JWT token passed as ?token= query param.
    IMPORTANT: accept() must be called before close() — otherwise the browser
    sees "WebSocket closed before connection established".
    """

    async def connect(self):
        # Parse token from query string
        query_string = self.scope.get("query_string", b"").decode()
        params = {}
        for part in query_string.split("&"):
            if "=" in part:
                k, v = part.split("=", 1)
                params[k] = v
        token = params.get("token", "")

        self.user = await self.get_user_from_token(token)

        if self.user is None or not self.user.is_authenticated:
            # Must accept first, then close — browser requires completed handshake
            await self.accept()
            await self.close(code=4001)
            return

        self.group_name = f"notifications_{self.user.id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        logger.debug(f"[NotifWS] User {self.user.username} connected")

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        # Server → client only; ignore anything sent by client
        pass

    async def send_notification(self, event):
        """Called by group_send from notification services."""
        await self.send(text_data=json.dumps({
            "type": "notification",
            "data": event["data"],
        }))

    @database_sync_to_async
    def get_user_from_token(self, token):
        if not token:
            return None
        try:
            access_token = AccessToken(token)
            # user_id may be int or string depending on JWT version
            user_id = int(access_token["user_id"])
            return User.objects.get(id=user_id)
        except Exception as e:
            logger.debug(f"[NotifWS] Token auth failed: {e}")
            return None
