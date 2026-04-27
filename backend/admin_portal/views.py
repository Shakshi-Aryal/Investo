from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import DailyUsageLog

# ----------------------------
# ADMIN LOGIN
# ----------------------------
class AdminLoginView(APIView):
    def post(self, request):
        username_or_email = request.data.get("username")
        password = request.data.get("password")

        if not username_or_email or not password:
            return Response({"error": "Credentials required"}, status=400)

        # Handle login by email or username (matching your accounts style)
        user_obj = User.objects.filter(email=username_or_email).first()
        username = user_obj.username if user_obj else username_or_email

        user = authenticate(username=username, password=password)

        if user is None:
            return Response({"error": "Invalid credentials"}, status=400)

        # Check if they actually have staff/admin privileges
        if not user.is_staff:
            return Response({"error": "Access denied. You are not an admin."}, status=403)

        # Log daily usage for the admin themselves
        log, _ = DailyUsageLog.objects.get_or_create(user=user, date=timezone.now().date())
        log.login_count += 1
        log.save()

        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "is_admin": True,
            "user": {
                "username": user.username,
                "email": user.email,
            }
        })

# ----------------------------
# ADMIN DASHBOARD DATA
# ----------------------------
class AdminUserStatsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        today = timezone.now().date()
        
        # General Stats
        total_users = User.objects.count()
        active_today = DailyUsageLog.objects.filter(date=today).count()

        # Detailed User List
        users_list = []
        all_users = User.objects.all().order_by('-date_joined')

        for u in all_users:
            # Get usage for today specifically
            today_log = DailyUsageLog.objects.filter(user=u, date=today).first()
            today_count = today_log.login_count if today_log else 0
            
            # Get total lifetime usage
            total_uses = DailyUsageLog.objects.filter(user=u).count() # Days used

            users_list.append({
                "id": u.id,
                "username": u.username,
                "email": u.email,
                "date_joined": u.date_joined.strftime("%Y-%m-%d"),
                "used_today_count": today_count,
                "total_days_active": total_uses,
                "is_staff": u.is_staff
            })

        return Response({
            "summary": {
                "total_users": total_users,
                "active_today": active_today
            },
            "users": users_list
        })