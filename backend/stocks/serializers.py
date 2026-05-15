"""
Serializers for the Stock Market module.
"""
from rest_framework import serializers
from .models import Stock, CandleData, MarketIndex, UserWatchlist, PriceAlert


class StockListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for stock lists."""
    class Meta:
        model = Stock
        fields = [
            'id', 'symbol', 'company_name', 'sector',
            'current_price', 'percentage_change', 'point_change',
            'volume', 'high_price', 'low_price', 'market_cap',
        ]


class StockDetailSerializer(serializers.ModelSerializer):
    """Full detail serializer for individual stock view."""
    is_watchlisted = serializers.SerializerMethodField()

    class Meta:
        model = Stock
        fields = [
            'id', 'symbol', 'company_name', 'sector',
            'current_price', 'open_price', 'close_price',
            'high_price', 'low_price', 'previous_close',
            'percentage_change', 'point_change',
            'volume', 'market_cap', 'total_listed_shares',
            'is_active', 'last_updated', 'is_watchlisted',
        ]

    def get_is_watchlisted(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return UserWatchlist.objects.filter(user=request.user, stock=obj).exists()
        return False


class CandleDataSerializer(serializers.ModelSerializer):
    """Serializer for OHLC candlestick data."""
    time = serializers.SerializerMethodField()

    class Meta:
        model = CandleData
        fields = ['time', 'open_price', 'high_price', 'low_price', 'close_price', 'volume']

    def get_time(self, obj):
        # Return Unix timestamp for TradingView Lightweight Charts
        import calendar
        return int(calendar.timegm(obj.timestamp.timetuple()))


class MarketIndexSerializer(serializers.ModelSerializer):
    """Serializer for market index overview."""
    class Meta:
        model = MarketIndex
        fields = [
            'index_name', 'index_value', 'change', 'percentage_change',
            'high', 'low', 'total_turnover', 'total_volume',
            'total_trades', 'advancing', 'declining', 'unchanged',
            'is_market_open', 'timestamp',
        ]


class WatchlistSerializer(serializers.ModelSerializer):
    """Serializer for user watchlist entries."""
    stock = StockListSerializer(read_only=True)
    stock_id = serializers.PrimaryKeyRelatedField(
        queryset=Stock.objects.all(), source='stock', write_only=True
    )

    class Meta:
        model = UserWatchlist
        fields = ['id', 'stock', 'stock_id', 'created_at']

    def validate(self, data):
        user = self.context['request'].user
        stock = data.get('stock')
        if UserWatchlist.objects.filter(user=user, stock=stock).exists():
            raise serializers.ValidationError("Stock already in watchlist.")
        return data


class PriceAlertSerializer(serializers.ModelSerializer):
    """Serializer for price alerts."""
    stock_symbol = serializers.CharField(source='stock.symbol', read_only=True)
    stock_name = serializers.CharField(source='stock.company_name', read_only=True)
    current_price = serializers.DecimalField(
        source='stock.current_price', max_digits=12, decimal_places=2, read_only=True
    )
    stock_id = serializers.PrimaryKeyRelatedField(
        queryset=Stock.objects.all(), source='stock', write_only=True
    )

    class Meta:
        model = PriceAlert
        fields = [
            'id', 'stock_id', 'stock_symbol', 'stock_name', 'current_price',
            'target_price', 'condition', 'is_active', 'is_triggered',
            'triggered_at', 'created_at',
        ]
        read_only_fields = ['is_triggered', 'triggered_at']


class SectorPerformanceSerializer(serializers.Serializer):
    """Serializer for sector-level performance data."""
    sector = serializers.CharField()
    sector_display = serializers.CharField()
    avg_change = serializers.DecimalField(max_digits=8, decimal_places=2)
    total_volume = serializers.IntegerField()
    stock_count = serializers.IntegerField()
    top_stock = serializers.CharField()
