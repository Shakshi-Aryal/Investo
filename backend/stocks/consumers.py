"""
WebSocket consumers for real-time market data streaming.
Market data is public — no authentication required.
"""
import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer

logger = logging.getLogger(__name__)


class MarketConsumer(AsyncWebsocketConsumer):
    """
    Broadcasts live market data to ALL connected clients (public).
    Group: 'market_updates'
    """

    async def connect(self):
        self.group_name = 'market_updates'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        logger.debug("[MarketWS] Client connected to global market feed")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)
        logger.debug(f"[MarketWS] Client disconnected (code={close_code})")

    async def receive(self, text_data):
        # Clients don't send data on this channel
        pass

    # ── Handlers for group_send messages from Celery tasks ──────────────────

    async def market_update(self, event):
        """Broadcast full market snapshot."""
        await self.send(text_data=json.dumps({
            'type': 'market_update',
            'data': event['data'],
        }))

    async def stock_update(self, event):
        """Broadcast single stock update."""
        await self.send(text_data=json.dumps({
            'type': 'stock_update',
            'data': event['data'],
        }))

    async def index_update(self, event):
        """Broadcast market index update."""
        await self.send(text_data=json.dumps({
            'type': 'index_update',
            'data': event['data'],
        }))


class StockDetailConsumer(AsyncWebsocketConsumer):
    """
    Streams real-time updates for a specific stock (public).
    Group: 'stock_{SYMBOL}'
    """

    async def connect(self):
        self.symbol = self.scope['url_route']['kwargs']['symbol'].upper()
        self.group_name = f'stock_{self.symbol}'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        logger.debug(f"[StockWS] Client connected to {self.symbol}")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        pass

    async def price_update(self, event):
        """Broadcast price tick for this stock."""
        await self.send(text_data=json.dumps({
            'type': 'price_update',
            'data': event['data'],
        }))

    async def candle_update(self, event):
        """Broadcast new candle data."""
        await self.send(text_data=json.dumps({
            'type': 'candle_update',
            'data': event['data'],
        }))
