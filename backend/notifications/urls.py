from django.urls import path
from . import views

urlpatterns = [
    path('', views.notification_list, name='notification-list'),
    path('unread-count/', views.unread_count, name='notification-unread-count'),
    path('mark-read/', views.mark_read, name='notification-mark-read'),
    path('events/', views.create_client_notification, name='notification-client-event'),
    path('<int:notification_id>/', views.delete_notification, name='notification-delete'),
]
