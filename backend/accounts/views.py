from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
import requests
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer, ProfileSerializer
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from rest_framework.permissions import IsAuthenticated
from .models import Profile


# ----------------------------
# REGISTER
# ----------------------------
class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user.is_active = False
            user.save()

            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            verify_url = f"http://localhost:5173/verify-email/{uid}/{token}/"

            send_mail(
                subject="Verify your Investo account",
                message=f"Hello {user.username},\n\nClick the link to verify your account:\n{verify_url}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
            )

            return Response(
                {"message": "Account created! Please verify your email."},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ----------------------------
# LOGIN (username or email)
# ----------------------------
class LoginView(APIView):
    def post(self, request):
        username_or_email = request.data.get("username")
        password = request.data.get("password")

        if not username_or_email or not password:
            return Response({"error": "Username/email and password are required"}, status=400)

        # Try to find user by email first
        try:
            user_obj = User.objects.filter(email=username_or_email).first()
            if user_obj:
                username = user_obj.username
            else:
                username = username_or_email
        except Exception:
            username = username_or_email

        user = authenticate(username=username, password=password)
        if user is None:
            return Response({"error": "Invalid username or password"}, status=400)

        if not user.is_active:
            return Response({"error": "Please verify your email before logging in!"}, status=403)

        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name
            }
        })


# ----------------------------
# VERIFY EMAIL
# ----------------------------
@api_view(['GET'])
def verify_email(request, uidb64, token):
    try:
        uid = urlsafe_base64_decode(uidb64).decode()
        user = User.objects.get(pk=uid)
    except:
        return Response({"error": "Invalid verification link"}, status=400)

    if not default_token_generator.check_token(user, token):
        return Response({"error": "Invalid or expired token"}, status=400)

    user.is_active = True
    user.save()
    return Response({"message": "Email verified successfully!"})


# ----------------------------
# GOOGLE LOGIN
# ----------------------------
@api_view(['POST'])
def google_login(request):
    code = request.data.get("code")
    if not code:
        return Response({"error": "No auth code provided"}, status=status.HTTP_400_BAD_REQUEST)

    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "code": code,
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "redirect_uri": "postmessage",
        "grant_type": "authorization_code",
    }

    try:
        token_response = requests.post(token_url, data=data)
        token_response.raise_for_status()
        tokens = token_response.json()
        id_token = tokens.get("id_token")
        access_token = tokens.get("access_token")

        if not id_token:
            return Response({"error": "Failed to obtain ID token"}, status=400)

        userinfo_url = "https://www.googleapis.com/oauth2/v3/userinfo"
        headers = {"Authorization": f"Bearer {access_token}"}
        userinfo_response = requests.get(userinfo_url, headers=headers)
        userinfo_response.raise_for_status()
        user_info = userinfo_response.json()

        email = user_info.get("email")
        first_name = user_info.get("given_name", "")
        last_name = user_info.get("family_name", "")

        user, created = User.objects.get_or_create(email=email, defaults={
            "username": email.split("@")[0],
            "first_name": first_name,
            "last_name": last_name,
            "is_active": True
        })

        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name
            }
        })

    except requests.RequestException as e:
        return Response({"error": "Google API failure", "details": str(e)}, status=500)


# ----------------------------
# PROFILE INFO
# ----------------------------
@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    user = request.user
    profile, _ = Profile.objects.get_or_create(user=user)

    if request.method == 'GET':
        serializer = ProfileSerializer(profile)
        data = serializer.data
        data.update({
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email
        })
        return Response(data)

    elif request.method == 'PUT':
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()

            user.username = request.data.get("username", user.username)
            user.first_name = request.data.get("first_name", user.first_name)
            user.last_name = request.data.get("last_name", user.last_name)
            user.email = request.data.get("email", user.email)

            try:
                user.save()
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

            updated_data = serializer.data
            updated_data.update({
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email
            })
            return Response(updated_data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# -------------------------------------------------
# ✅ NEPSE API PROXY (Fixes CORS error in React)
# -------------------------------------------------
@api_view(['GET'])
def nepse_proxy(request):
    symbol = request.GET.get("symbol")

    if not symbol:
        return Response({"error": "Symbol is required"}, status=400)

    url = f"https://nepseapi.surajrimal.dev/PriceHistory?symbol={symbol}"

    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        return Response(data)
    except Exception as e:
        return Response({"error": "Failed to fetch NEPSE data", "details": str(e)}, status=500)
