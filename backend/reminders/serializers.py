from rest_framework import serializers
from .models import Reminder

class ReminderSerializer(serializers.ModelSerializer):
    # Force strict formatting to match the frontend strings
    time = serializers.TimeField(format='%H:%M', input_formats=['%H:%M', '%H:%M:%S'])
    date = serializers.DateField(format='%Y-%m-%d', input_formats=['%Y-%m-%d'])

    class Meta:
        model = Reminder
        fields = ['id', 'title', 'description', 'date', 'time', 'email_notify', 'is_completed']
        read_only_fields = ['is_completed']