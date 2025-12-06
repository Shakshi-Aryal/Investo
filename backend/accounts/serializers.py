from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import Profile
from .utils import send_verification_email

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

        user = User.objects.create_user(
            **validated_data,
            is_active=False  # user inactive until email verified
        )

        Profile.objects.create(user=user, date_of_birth=dob)

        # send email verification
        send_verification_email(user)

        return user
