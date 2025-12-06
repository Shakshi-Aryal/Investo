from django.urls import path
from .views import RegisterView, LoginView, google_login, verify_email

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('google-login/', google_login, name='google-login'),
    path('verify-email/<uidb64>/<token>/', verify_email, name='verify-email'),
]
