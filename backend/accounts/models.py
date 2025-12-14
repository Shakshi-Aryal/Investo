from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    date_of_birth = models.DateField(null=True, blank=True)

    #  NEW FIELD — this replaces is_active email verification
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return self.user.username
