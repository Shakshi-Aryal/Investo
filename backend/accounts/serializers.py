from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import Profile
from .utils import send_verification_email


# ------------------------------
# REGISTER SERIALIZER
# ------------------------------
class RegisterSerializer(serializers.ModelSerializer):
    confirmPassword = serializers.CharField(write_only=True, required=False)
    date_of_birth = serializers.DateField(required=False)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'first_name', 'last_name',
            'password', 'confirmPassword', 'date_of_birth'
        ]

    def validate(self, attrs):
        password = attrs.get('password')
        confirm = attrs.get('confirmPassword')

        if confirm is not None and password != confirm:
            raise serializers.ValidationError({"error": "Passwords do not match"})

        validate_password(password)
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirmPassword', None)
        dob = validated_data.pop('date_of_birth', None)

        # ❌ OLD BUG:
        # user = User.objects.create_user(..., is_active=False)

        # ✅ FIX: user account stays active
        user = User.objects.create_user(**validated_data)

        # Create profile
        profile = Profile.objects.create(
            user=user,
            date_of_birth=dob,
            is_verified=False  # verification required
        )

        # Send verification email
        send_verification_email(user)

        return user


# ------------------------------
# PROFILE SERIALIZER
# ------------------------------
class ProfileSerializer(serializers.ModelSerializer):
    # Include related User fields
    first_name = serializers.CharField(source='user.first_name', required=False)
    last_name = serializers.CharField(source='user.last_name', required=False)
    email = serializers.EmailField(source='user.email', required=False)

    class Meta:
        model = Profile
        fields = ['first_name', 'last_name', 'email', 'date_of_birth']

    def update(self, instance, validated_data):
        profile_data = validated_data
        user_data = validated_data.get('user', {})

        instance.date_of_birth = profile_data.get('date_of_birth', instance.date_of_birth)
        instance.save()

        user = instance.user
        user.first_name = user_data.get('first_name', user.first_name)
        user.last_name = user_data.get('last_name', user.last_name)
        user.email = user_data.get('email', user.email)
        user.save()

        return instance
