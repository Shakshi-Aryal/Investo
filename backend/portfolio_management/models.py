from django.db import models
from django.contrib.auth.models import User


class Portfolio(models.Model):
    INVESTMENT_TYPE_CHOICES = [
        ('stocks_digital', 'Stocks / Digital Assets'),
        ('real_estate', 'Real Estate'),
        ('cash', 'Cash & Liquidity'),
        ('precious_metals', 'Gold / Silver'),
        ('other_physical', 'Other Physical'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    investment_name = models.CharField(max_length=200)
    investment_type = models.CharField(
        max_length=32,
        choices=INVESTMENT_TYPE_CHOICES,
        default='stocks_digital',
    )
    stock_symbol = models.CharField(max_length=20, blank=True, default='')
    quantity = models.FloatField(default=1.0)
    total_capital = models.FloatField()
    investment_amount = models.FloatField()
    estimated_return_per_year = models.FloatField()
    time_period = models.IntegerField()
    roi = models.FloatField(blank=True, null=True)

    def save(self, *args, **kwargs):
        if self.total_capital > 0:
            self.roi = ((self.investment_amount - self.total_capital) / self.total_capital) * 100
        else:
            self.roi = 0
        super().save(*args, **kwargs)

    def __str__(self):
        return self.investment_name
