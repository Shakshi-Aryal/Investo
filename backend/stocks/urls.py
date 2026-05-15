"""
URL patterns for the Stock Market module.
All prefixed with /api/market/ in the root urls.py
"""
from django.urls import path
from . import views

urlpatterns = [
    # Market overview
    path('overview/', views.market_overview, name='market-overview'),
    path('status/', views.market_status, name='market-status'),
    path('sectors/', views.sector_performance, name='sector-performance'),

    # Stock endpoints
    path('stocks/', views.stock_list, name='stock-list'),
    path('stocks/<str:symbol>/', views.stock_detail, name='stock-detail'),
    path('stocks/<str:symbol>/history/', views.stock_history, name='stock-history'),
    path('stocks/<str:symbol>/indicators/', views.stock_indicators, name='stock-indicators'),

    # Watchlist (authenticated)
    path('watchlist/', views.watchlist_view, name='watchlist'),
    path('watchlist/toggle/', views.watchlist_toggle, name='watchlist-toggle'),
    path('watchlist/<int:stock_id>/', views.watchlist_remove, name='watchlist-remove'),

    # Price alerts (authenticated)
    path('alerts/', views.alert_view, name='alert-list'),
    path('alerts/<int:alert_id>/', views.alert_delete, name='alert-delete'),
]