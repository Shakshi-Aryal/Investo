"""
WebSocket URL routing for the stocks/market module.
"""
from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('ws/market/', consumers.MarketConsumer.as_asgi()),
    path('ws/market/<str:symbol>/', consumers.StockDetailConsumer.as_asgi()),
]
