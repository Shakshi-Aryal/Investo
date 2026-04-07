from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from datetime import datetime
from .models import Reminder
from .serializers import ReminderSerializer

class ReminderListCreate(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        reminders = Reminder.objects.filter(user=request.user)
        serializer = ReminderSerializer(reminders, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ReminderSerializer(data=request.data)
        if serializer.is_valid():
            # 1. Extract validated data
            reminder_date = serializer.validated_data.get('date')
            
            # 2. Get current server time (Nepal Time based on your settings)
            now = datetime.now()
            current_date = now.date()

            # 3. DATE CORRECTION LOGIC
            # If the frontend sends a date from the past (usually because of UTC shifts),
            # but the user is clearly setting a reminder for 'today' or 'the future',
            # we force it to the current server date.
            if reminder_date < current_date:
                # We assume if they are posting at 2:00 AM, they mean 2:00 AM today.
                reminder_date = current_date

            # 4. Save with the corrected date
            reminder = serializer.save(
                user=request.user, 
                date=reminder_date,
                is_completed=False  # Ensure new reminders are always active
            )
            
            return Response(ReminderSerializer(reminder).data, status=201)
        
        return Response(serializer.errors, status=400)


class ReminderDetail(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        try:
            reminder = Reminder.objects.get(pk=pk, user=request.user)
        except Reminder.DoesNotExist:
            return Response({"detail": "Reminder not found"}, status=404)

        serializer = ReminderSerializer(reminder, data=request.data, partial=True)
        if serializer.is_valid():
            # Apply same logic for updates if date is provided
            new_date = serializer.validated_data.get('date', reminder.date)
            if new_date < datetime.now().date():
                new_date = datetime.now().date()
                
            updated_reminder = serializer.save(date=new_date)
            return Response(ReminderSerializer(updated_reminder).data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        try:
            reminder = Reminder.objects.get(pk=pk, user=request.user)
            reminder.delete()
            return Response(status=204)
        except Reminder.DoesNotExist:
            return Response({"detail": "Reminder not found"}, status=404)