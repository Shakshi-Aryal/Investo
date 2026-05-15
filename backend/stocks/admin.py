from django.contrib import admin
from .models import Stock, CandleData, MarketIndex, UserWatchlist, PriceAlert


@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display = ['symbol', 'company_name', 'sector', 'current_price', 'percentage_change', 'volume', 'is_active']
    list_filter = ['sector', 'is_active']
    search_fields = ['symbol', 'company_name']
    ordering = ['symbol']


@admin.register(CandleData)
class CandleDataAdmin(admin.ModelAdmin):
    list_display = ['stock', 'timestamp', 'timeframe', 'open_price', 'high_price', 'low_price', 'close_price', 'volume']
    list_filter = ['timeframe', 'stock']
    ordering = ['-timestamp']


@admin.register(MarketIndex)
class MarketIndexAdmin(admin.ModelAdmin):
    list_display = ['index_name', 'index_value', 'percentage_change', 'advancing', 'declining', 'is_market_open']


@admin.register(UserWatchlist)
class UserWatchlistAdmin(admin.ModelAdmin):
    list_display = ['user', 'stock', 'created_at']
    list_filter = ['user']


@admin.register(PriceAlert)
class PriceAlertAdmin(admin.ModelAdmin):
    list_display = ['user', 'stock', 'target_price', 'condition', 'is_active', 'is_triggered', 'triggered_at']
    list_filter = ['is_active', 'is_triggered', 'condition']
