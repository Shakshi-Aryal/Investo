from django.db import models
from django.contrib.auth.models import User

class Expense(models.Model):
    TYPE_CHOICES = (
        ("income", "Income"),
        ("expense", "Expense"),
        ("saving", "Saving"),  # New type for savings
    )

    CATEGORY_CHOICES = (
        ("food", "Food"),
        ("clothing", "Clothing"),
        ("emi", "EMI"),
        ("misc", "Miscellaneous"),
        ("salary", "Salary"),
        ("other", "Other"),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    amount = models.FloatField()
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default="other")  # New category field
    description = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)  # Timestamp

    def __str__(self):
        return f"{self.type} - {self.amount} - {self.category}"
