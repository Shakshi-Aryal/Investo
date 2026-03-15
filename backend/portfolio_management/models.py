from django.db import models
from django.contrib.auth.models import User

class Portfolio(models.Model):

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    investment_name = models.CharField(max_length=200)
    total_capital = models.FloatField()
    investment_amount = models.FloatField()
    estimated_return_per_year = models.FloatField()
    time_period = models.IntegerField()

    roi = models.FloatField(blank=True, null=True)

    def save(self, *args, **kwargs):

        # ROI calculation
        if self.total_capital > 0:
            self.roi = ((self.investment_amount - self.total_capital) / self.total_capital) * 100
        else:
            self.roi = 0

        super().save(*args, **kwargs)

    def __str__(self):
        return self.investment_name