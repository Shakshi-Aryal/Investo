import logging

from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.utils import timezone

import requests

from .serializers import RegisterSerializer, ProfileSerializer
from .models import Profile
from admin_portal.models import DailyUsageLog


# =========================================================
# HELPER FUNCTIONS
# =========================================================

def create_usage_log(user):
    """
    Track daily login usage.
    """

    try:
        log, _ = DailyUsageLog.objects.get_or_create(
            user=user,
            date=timezone.now().date()
        )

        log.login_count += 1
        log.save()

    except Exception as e:
        logging.getLogger(__name__).warning('Daily usage log error: %s', e)


def generate_unique_username(email):
    """
    Generate unique username safely.
    """

    base_username = email.split("@")[0]
    username = base_username
    counter = 1

    while User.objects.filter(username=username).exists():
        username = f"{base_username}{counter}"
        counter += 1

    return username


def generate_auth_response(user):
    """
    Generate JWT auth response.
    """

    refresh = RefreshToken.for_user(user)

    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": {
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name
        }
    }


# =========================================================
# REGISTER
# =========================================================

class RegisterView(APIView):

    def post(self, request):

        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():

            user = serializer.save()

            # Require email verification
            user.is_active = False
            user.save()

            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)

            # FIX: use FRONTEND_URL from settings instead of hardcoded localhost
            frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
            verify_url = f"{frontend_url}/verify-email/{uid}/{token}/"

            send_mail(
                subject="Verify your Investo account",
                message=(
                    f"Hello {user.username},\n\n"
                    f"Click the link below to verify your account:\n\n"
                    f"{verify_url}"
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
            )

            return Response(
                {
                    "message":
                    "Account created successfully. Please verify your email."
                },
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# =========================================================
# LOGIN
# =========================================================

class LoginView(APIView):

    def post(self, request):

        username_or_email = request.data.get("username")
        password = request.data.get("password")

        if not username_or_email or not password:
            return Response(
                {
                    "error":
                    "Username/email and password are required."
                },
                status=400
            )

        # Try email lookup first
        try:
            user_obj = User.objects.filter(
                email=username_or_email
            ).first()

            username = (
                user_obj.username
                if user_obj
                else username_or_email
            )

        except Exception:
            username = username_or_email

        user = authenticate(
            username=username,
            password=password
        )

        # Invalid credentials
        if user is None:

            existing_user = User.objects.filter(
                username=username
            ).first()

            # OAuth account trying password login
            if existing_user and not existing_user.has_usable_password():

                return Response(
                    {
                        "error":
                        (
                            "This account uses Google Sign-In. "
                            "Please continue with Google or "
                            "reset your password."
                        )
                    },
                    status=400
                )

            return Response(
                {
                    "error":
                    "Invalid username or password."
                },
                status=400
            )

        # Email verification required
        if not user.is_active:
            return Response(
                {
                    "error":
                    "Please verify your email before logging in."
                },
                status=403
            )

        create_usage_log(user)

        return Response(generate_auth_response(user))


# =========================================================
# VERIFY EMAIL
# =========================================================

@api_view(['GET'])
def verify_email(request, uidb64, token):

    try:
        uid = urlsafe_base64_decode(uidb64).decode()
        user = User.objects.get(pk=uid)

    except Exception:
        return Response(
            {
                "error":
                "Invalid verification link."
            },
            status=400
        )

    if not default_token_generator.check_token(user, token):

        return Response(
            {
                "error":
                "Invalid or expired token."
            },
            status=400
        )

    user.is_active = True
    user.save()

    return Response({
        "message": "Email verified successfully."
    })


# =========================================================
# FORGOT PASSWORD
# =========================================================

@api_view(["POST"])
def forgot_password(request):

    email = request.data.get("email")

    if not email:
        return Response(
            {
                "error":
                "Email is required."
            },
            status=400
        )

    user = User.objects.filter(email=email).first()

    # Prevent account enumeration
    if not user:
        return Response(
            {
                "message":
                "If the email exists, a reset link has been sent."
            },
            status=200
        )

    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)

    # FIX: use FRONTEND_URL from settings instead of hardcoded localhost
    frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
    reset_url = f"{frontend_url}/reset-password/{uid}/{token}/"

    send_mail(
        subject="Reset your Investo password",
        message=(
            f"Hi {user.username},\n\n"
            f"Click the link below to reset your password:\n\n"
            f"{reset_url}"
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
    )

    return Response(
        {
            "message":
            "If the email exists, a reset link has been sent."
        },
        status=200
    )


# =========================================================
# RESET PASSWORD
# =========================================================

@api_view(["POST"])
def reset_password(request, uidb64, token):

    try:
        uid = force_str(
            urlsafe_base64_decode(uidb64)
        )

        user = User.objects.get(pk=uid)

    except Exception:
        return Response(
            {
                "error":
                "Invalid reset link."
            },
            status=400
        )

    if not default_token_generator.check_token(user, token):

        return Response(
            {
                "error":
                "Reset link expired or invalid."
            },
            status=400
        )

    password = request.data.get("password")

    if not password or len(password) < 6:

        return Response(
            {
                "error":
                "Password must be at least 6 characters."
            },
            status=400
        )

    # FIX: activate the account on successful password reset.
    # A valid reset link proves email ownership, so unverified users
    # are no longer locked out after resetting their password.
    user.is_active = True
    user.set_password(password)
    user.save()

    return Response({
        "message": "Password reset successful."
    })


# =========================================================
# GOOGLE LOGIN  — original structure kept exactly, one fix added
# =========================================================

@api_view(['POST'])
def google_login(request):

    code = request.data.get("code")

    if not code:
        return Response(
            {
                "error":
                "No authorization code provided."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    token_url = "https://oauth2.googleapis.com/token"

    payload = {
        "code": code,
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "redirect_uri": "postmessage",
        "grant_type": "authorization_code",
    }

    try:

        # =====================================================
        # EXCHANGE AUTH CODE FOR TOKEN
        # =====================================================

        token_response = requests.post(
            token_url,
            data=payload
        )

        token_response.raise_for_status()

        tokens = token_response.json()

        access_token = tokens.get("access_token")

        if not access_token:
            return Response(
                {
                    "error":
                    "Failed to obtain access token."
                },
                status=400
            )

        # =====================================================
        # GET USER INFO FROM GOOGLE
        # =====================================================

        userinfo_response = requests.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={
                "Authorization":
                f"Bearer {access_token}"
            }
        )

        userinfo_response.raise_for_status()

        user_info = userinfo_response.json()

        email = user_info.get("email")

        if not email:
            return Response(
                {
                    "error":
                    "Google account email not found."
                },
                status=400
            )

        first_name = user_info.get("given_name", "")
        last_name = user_info.get("family_name", "")

        # =====================================================
        # FIND EXISTING USER
        # =====================================================

        user = User.objects.filter(email=email).first()

        # =====================================================
        # CREATE USER IF NOT EXISTS
        # =====================================================

        if not user:

            username = generate_unique_username(email)

            # OAuth accounts have unusable passwords
            user = User.objects.create_user(
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name,
                password=None
            )

            user.is_active = True
            user.save()

        # =====================================================
        # UPDATE EMPTY PROFILE FIELDS
        # =====================================================

        updated = False

        # FIX: activate existing user if they registered manually
        # but never verified their email — Google has now verified it.
        if not user.is_active:
            user.is_active = True
            updated = True

        if not user.first_name and first_name:
            user.first_name = first_name
            updated = True

        if not user.last_name and last_name:
            user.last_name = last_name
            updated = True

        if updated:
            user.save()

        create_usage_log(user)

        return Response(generate_auth_response(user))

    except requests.RequestException as e:

        logging.getLogger(__name__).warning('Google API error: %s', e)

        return Response(
            {
                "error":
                "Google authentication failed.",
                "details": str(e)
            },
            status=500
        )

    except Exception as e:

        logging.getLogger(__name__).warning('Google login error: %s', e)

        return Response(
            {
                "error":
                "Google login failed.",
                "details": str(e)
            },
            status=500
        )


# =========================================================
# PROFILE
# =========================================================

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile_view(request):

    user = request.user

    profile, _ = Profile.objects.get_or_create(
        user=user
    )

    # =====================================================
    # GET PROFILE
    # =====================================================

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

    # =====================================================
    # UPDATE PROFILE
    # =====================================================

    elif request.method == 'PUT':

        serializer = ProfileSerializer(
            profile,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            user.username = request.data.get(
                "username",
                user.username
            )

            user.first_name = request.data.get(
                "first_name",
                user.first_name
            )

            user.last_name = request.data.get(
                "last_name",
                user.last_name
            )

            user.email = request.data.get(
                "email",
                user.email
            )

            try:
                user.save()

            except Exception as e:
                return Response(
                    {
                        "error": str(e)
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            updated_data = serializer.data

            updated_data.update({
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email
            })

            return Response(updated_data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )