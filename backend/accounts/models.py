from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    date_of_birth = models.DateField(null=True, blank=True)
    avatar = models.TextField(null=True, blank=True)

    is_verified = models.BooleanField(default=False)
    trading_balance = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=500000,
        help_text='Simulated NPR cash for NEPSE market purchases',
    )

    def __str__(self):
        return self.user.username

