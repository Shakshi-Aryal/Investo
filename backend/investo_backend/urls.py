# investo_backend/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # Built-in Django Admin (for database management)
    path('admin/', admin.site.urls),
    
    # Your Custom Admin Portal API
    path('api/admin-portal/', include('admin_portal.urls')),

    # App APIs
    path('api/', include('accounts.urls')),
    path("api/expenses/", include("expenses.urls")),
    path("api/reminders/", include("reminders.urls")),
    path('api/', include('portfolio_management.urls')),
    path('api/market/', include('stocks.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/community/', include('community.urls')),
]