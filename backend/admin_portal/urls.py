from django.urls import path
from .views import AdminLoginView, AdminUserStatsView

urlpatterns = [
    path('login/', AdminLoginView.as_view(), name='admin_login'),
    path('stats/', AdminUserStatsView.as_view(), name='admin_stats'),
]