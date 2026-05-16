"""
Stock Market Models for Investo Platform.
Supports simulated NEPSE-style market data with full OHLC candlestick support.
Designed for future migration to real market APIs.
"""

from django.db import models
from django.contrib.auth.models import User


class Stock(models.Model):
    """Represents a single listed stock/company in the simulated market."""

    SECTOR_CHOICES = [
        ('commercial_bank', 'Commercial Bank'),
        ('development_bank', 'Development Bank'),
        ('finance', 'Finance'),
        ('insurance', 'Insurance'),
        ('hydropower', 'Hydropower'),
        ('manufacturing', 'Manufacturing'),
        ('microfinance', 'Microfinance'),
        ('hotel_tourism', 'Hotel & Tourism'),
        ('trading', 'Trading'),
        ('others', 'Others'),
    ]

    symbol = models.CharField(
        max_length=20,
        unique=True,
        db_index=True
    )

    company_name = models.CharField(max_length=200)

    sector = models.CharField(
        max_length=50,
        choices=SECTOR_CHOICES,
        default='others'
    )

    # =====================================================
    # LIVE PRICE DATA
    # =====================================================

    current_price = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        default=0
    )

    open_price = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        default=0
    )

    close_price = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        default=0
    )

    high_price = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        default=0
    )

    low_price = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        default=0
    )

    previous_close = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        default=0
    )

    # =====================================================
    # MARKET DATA
    # =====================================================

    volume = models.BigIntegerField(default=0)

    market_cap = models.DecimalField(
        max_digits=25,
        decimal_places=2,
        default=0
    )

    percentage_change = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    point_change = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        default=0
    )

    # =====================================================
    # METADATA
    # =====================================================

    total_listed_shares = models.BigIntegerField(default=1000000)

    is_active = models.BooleanField(default=True)

    last_updated = models.DateTimeField(auto_now=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['symbol']

    def __str__(self):
        return f"{self.symbol} - {self.company_name}"

    def update_price(self, new_price):
        """Update stock price and recalculate derived fields."""

        from decimal import Decimal

        new_price = Decimal(str(new_price))

        self.current_price = new_price

        if new_price > self.high_price:
            self.high_price = new_price

        if new_price < self.low_price or self.low_price == 0:
            self.low_price = new_price

        if self.previous_close > 0:
            from stocks.services.nepse_simulation import clamp_percentage_change

            self.point_change = new_price - self.previous_close
            raw_pct = (self.point_change / self.previous_close) * 100
            self.percentage_change = clamp_percentage_change(raw_pct)

        self.market_cap = (
            new_price * self.total_listed_shares
        )

        self.save()


class CandleData(models.Model):
    """OHLC candlestick data for charting."""

    TIMEFRAME_CHOICES = [
        ('1m', '1 Minute'),
        ('5m', '5 Minutes'),
        ('15m', '15 Minutes'),
        ('1h', '1 Hour'),
        ('1d', '1 Day'),
        ('1w', '1 Week'),
    ]

    stock = models.ForeignKey(
        Stock,
        on_delete=models.CASCADE,
        related_name='candles'
    )

    timestamp = models.DateTimeField(db_index=True)

    timeframe = models.CharField(
        max_length=5,
        choices=TIMEFRAME_CHOICES,
        default='1d'
    )

    open_price = models.DecimalField(
        max_digits=20,
        decimal_places=2
    )

    high_price = models.DecimalField(
        max_digits=20,
        decimal_places=2
    )

    low_price = models.DecimalField(
        max_digits=20,
        decimal_places=2
    )

    close_price = models.DecimalField(
        max_digits=20,
        decimal_places=2
    )

    volume = models.BigIntegerField(default=0)

    class Meta:
        ordering = ['timestamp']

        unique_together = ['stock', 'timestamp', 'timeframe']

        indexes = [
            models.Index(
                fields=['stock', 'timeframe', 'timestamp']
            ),
        ]

    def __str__(self):
        return f"{self.stock.symbol} {self.timeframe} {self.timestamp}"


class MarketIndex(models.Model):
    """Simulated market index (NEPSE-style)."""

    index_name = models.CharField(
        max_length=50,
        default='NEPSE'
    )

    index_value = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        default=0
    )

    change = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        default=0
    )

    percentage_change = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    high = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        default=0
    )

    low = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        default=0
    )

    total_turnover = models.DecimalField(
        max_digits=25,
        decimal_places=2,
        default=0
    )

    total_volume = models.BigIntegerField(default=0)

    total_trades = models.BigIntegerField(default=0)

    advancing = models.IntegerField(default=0)

    declining = models.IntegerField(default=0)

    unchanged = models.IntegerField(default=0)

    is_market_open = models.BooleanField(default=False)

    timestamp = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.index_name}: {self.index_value}"


class UserWatchlist(models.Model):
    """User-specific stock watchlist."""

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='stock_watchlist'
    )

    stock = models.ForeignKey(
        Stock,
        on_delete=models.CASCADE,
        related_name='watchlisted_by'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'stock']

        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} → {self.stock.symbol}"


class PriceAlert(models.Model):
    """Price alert that triggers when a stock reaches a target price."""

    CONDITION_CHOICES = [
        ('above', 'Price Goes Above'),
        ('below', 'Price Goes Below'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='price_alerts'
    )

    stock = models.ForeignKey(
        Stock,
        on_delete=models.CASCADE,
        related_name='alerts'
    )

    target_price = models.DecimalField(
        max_digits=20,
        decimal_places=2
    )

    condition = models.CharField(
        max_length=10,
        choices=CONDITION_CHOICES
    )

    is_active = models.BooleanField(default=True)

    is_triggered = models.BooleanField(default=False)

    triggered_at = models.DateTimeField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return (
            f"{self.user.username}: "
            f"{self.stock.symbol} "
            f"{self.condition} "
            f"{self.target_price}"
        )

    def check_condition(self, current_price):
        """Check if the alert condition is met."""

        from decimal import Decimal

        current_price = Decimal(str(current_price))

        if (
            self.condition == 'above'
            and current_price >= self.target_price
        ):
            return True

        if (
            self.condition == 'below'
            and current_price <= self.target_price
        ):
            return True

        return False