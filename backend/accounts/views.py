from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from django.contrib.auth import authenticate

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated

import requests

from .serializers import RegisterSerializer, ProfileSerializer


# ------------------------- REGISTER ------------------------------

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            # user inactive until email verified
            user.is_active = False
            user.save()

            # generate verify url
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            verify_url = f"http://localhost:5173/verify-email/{uid}/{token}/"

            # send mail
            send_mail(
                subject="Verify your Investo account",
                message=f"Hello {user.username},\n\nClick to verify:\n{verify_url}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
            )

            return Response({"message": "Account created! Please verify your email."}, status=201)

        return Response(serializer.errors, status=400)


# ------------------------- LOGIN ------------------------------

class LoginView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username=username, password=password)

        if user is None:
            return Response({"error": "Invalid username or password"}, status=400)

        if not user.is_active:
            return Response({"error": "Please verify your email first!"}, status=403)

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


# ------------------------- VERIFY EMAIL ------------------------------

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


# ------------------------- GOOGLE LOGIN ------------------------------

@api_view(['POST'])
def google_login(request):
    code = request.data.get("code")

    if not code:
        return Response({"error": "No auth code provided"}, status=400)

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
            return Response({"error": "Google login failed"}, status=400)

        # fetch user info from Google
        userinfo_url = "https://www.googleapis.com/oauth2/v3/userinfo"
        headers = {"Authorization": f"Bearer {access_token}"}
        userinfo_response = requests.get(userinfo_url, headers=headers)
        userinfo_response.raise_for_status()
        user_info = userinfo_response.json()

        email = user_info.get("email")
        first_name = user_info.get("given_name", "")
        last_name = user_info.get("family_name", "")

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "username": email.split("@")[0],
                "first_name": first_name,
                "last_name": last_name,
                "is_active": True,
            }
        )

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


# ------------------------- PROFILE GET + UPDATE ------------------------------

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Return logged-in user's profile"""
        serializer = ProfileSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        """Update first_name / last_name"""
        serializer = ProfileSerializer(
            request.user,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Profile updated", "user": serializer.data})

        return Response(serializer.errors, status=400)
