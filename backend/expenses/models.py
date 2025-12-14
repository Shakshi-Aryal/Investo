from django.db import models
from django.contrib.auth.models import User

class Expense(models.Model):
    TYPE_CHOICES = (
        ("income", "Income"),
        ("expense", "Expense"),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    amount = models.FloatField()
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    description = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.type} - {self.amount}"
