from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import send_mail
from django.conf import settings
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
            reminder = serializer.save(user=request.user)

            # --- SEND EMAIL IF EMAIL_NOTIFY IS TRUE ---
            if reminder.email_notify and request.user.email:
                try:
                    send_mail(
                        subject=f"Reminder: {reminder.title}",
                        message=f"{reminder.description or 'No description'}\nTime: {reminder.time}\nDate: {reminder.date}",
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[request.user.email],
                        fail_silently=False,
                    )
                except Exception as e:
                    print("Email sending failed:", e)  # You can log this properly

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
            updated_reminder = serializer.save()

            # --- OPTIONAL: SEND EMAIL IF TIME CHANGED AND EMAIL_NOTIFY IS TRUE ---
            if updated_reminder.email_notify and request.user.email:
                # You can optionally send a notification here too
                pass

            return Response(ReminderSerializer(updated_reminder).data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        try:
            reminder = Reminder.objects.get(pk=pk, user=request.user)
            reminder.delete()
            return Response(status=204)
        except Reminder.DoesNotExist:
            return Response({"detail": "Reminder not found"}, status=404)
