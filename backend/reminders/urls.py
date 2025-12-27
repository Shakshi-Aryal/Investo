from django.urls import path
from .views import ReminderListCreate, ReminderDetail

urlpatterns = [
    path("", ReminderListCreate.as_view()),
    path("<int:pk>/", ReminderDetail.as_view()),
]
