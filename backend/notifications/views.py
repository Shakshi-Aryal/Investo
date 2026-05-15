"""
API Views for the Notification system.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime

from .models import Notification
from .serializers import NotificationSerializer
from .services import get_unread_count, mark_all_read


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notification_list(request):
    """
    Get paginated list of user notifications.
    Query params: limit (default 20), offset (default 0), unread_only (bool)
    """
    notifications = Notification.objects.filter(user=request.user)

    unread_only = request.query_params.get('unread_only', 'false').lower() == 'true'
    if unread_only:
        notifications = notifications.filter(is_read=False)

    limit = int(request.query_params.get('limit', 20))
    offset = int(request.query_params.get('offset', 0))
    total = notifications.count()
    notifications = notifications[offset:offset + limit]

    serializer = NotificationSerializer(notifications, many=True)
    return Response({
        'results': serializer.data,
        'total': total,
        'unread_count': get_unread_count(request.user),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unread_count(request):
    """Get the unread notification count for the bell badge."""
    count = get_unread_count(request.user)
    return Response({'unread_count': count})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_read(request):
    """
    Mark notifications as read.
    Body: { notification_id: int } for single, or { all: true } for all.
    """
    notification_id = request.data.get('notification_id')
    mark_all = request.data.get('all', False)

    if mark_all:
        count = mark_all_read(request.user)
        return Response({'status': 'ok', 'marked': count})

    if notification_id:
        try:
            notif = Notification.objects.get(id=notification_id, user=request.user)
            notif.is_read = True
            notif.read_at = datetime.now()
            notif.save(update_fields=['is_read', 'read_at'])
            return Response({'status': 'ok'})
        except Notification.DoesNotExist:
            return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)

    return Response({'error': 'Provide notification_id or all=true'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_notification(request, notification_id):
    """Delete a single notification."""
    deleted, _ = Notification.objects.filter(id=notification_id, user=request.user).delete()
    if deleted:
        return Response({'status': 'deleted'})
    return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
