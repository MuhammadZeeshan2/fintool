from django.db import models
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
import json
# Create your models here.
# class User(AbstractUser):
#   tenant = models.ForeignKey(default=None, null=True, on_delete=models.CASCADE, related_name="users")
#   user_expiry = models.DateTimeField(null=True, blank=True)
