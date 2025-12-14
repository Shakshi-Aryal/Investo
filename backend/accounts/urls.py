from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    google_login,
    verify_email,
    profile_view,
    nepse_proxy,
    forgot_password,     # 🔹 forgot password view
    reset_password       # 🔹 reset password view
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('google-login/', google_login, name='google-login'),
    path('verify-email/<uidb64>/<token>/', verify_email, name='verify-email'),
    path('profile/', profile_view, name='profile'),
    
    # NEPSE proxy
    path('api/nepse/', nepse_proxy, name='nepse-proxy'),

    # 🔹 Forgot/Reset Password
    path('forgot-password/', forgot_password, name='forgot-password'),
    path('reset-password/<uidb64>/<token>/', reset_password, name='reset-password'),
]
