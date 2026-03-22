from django.db import models

class Stock(models.Model):
    symbol = models.CharField(max_length=20, unique=True)
    last_traded_price = models.FloatField(null=True, blank=True)
    percentage_change = models.FloatField(default=0.0)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.symbol

class Watchlist(models.Model):
    symbol = models.CharField(max_length=20, unique=True)
    added_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.symbol