"""
ASGI config for investo_backend.
Handles both HTTP (Django) and WebSocket (Channels) traffic.
"""
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'investo_backend.settings')

# Must initialise Django ASGI app before importing any ORM-dependent code
from django.core.asgi import get_asgi_application
django_asgi_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter
from community.routing     import websocket_urlpatterns as community_ws
from stocks.routing        import websocket_urlpatterns as market_ws
from notifications.routing import websocket_urlpatterns as notification_ws

# Combine all WebSocket URL patterns
all_ws_patterns = community_ws + market_ws + notification_ws

application = ProtocolTypeRouter({
    # Standard HTTP → Django views
    "http": django_asgi_app,

    # WebSocket → Channels consumers
    # No AllowedHostsOriginValidator so localhost dev works without ALLOWED_HOSTS issues
    "websocket": URLRouter(all_ws_patterns),
})
