from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from .models import ChatGroup, Membership, Message
from .serializers import ChatGroupSerializer, MessageSerializer, MembershipSerializer


class MessagePagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = "page_size"
    max_page_size = 100


# ────────────────────────────
# LIST / CREATE GROUPS
# ────────────────────────────
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def group_list_create(request):
    if request.method == "GET":
        groups = ChatGroup.objects.all()
        serializer = ChatGroupSerializer(groups, many=True, context={"request": request})
        return Response(serializer.data)

    elif request.method == "POST":
        serializer = ChatGroupSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            group = serializer.save(creator=request.user)
            # Auto-join creator as admin
            Membership.objects.create(user=request.user, group=group, role="admin")
            return Response(
                ChatGroupSerializer(group, context={"request": request}).data,
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ────────────────────────────
# GROUP DETAIL
# ────────────────────────────
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def group_detail(request, group_id):
    try:
        group = ChatGroup.objects.get(id=group_id)
    except ChatGroup.DoesNotExist:
        return Response({"error": "Group not found"}, status=404)

    data = ChatGroupSerializer(group, context={"request": request}).data
    members = Membership.objects.filter(group=group).select_related("user")
    data["members"] = MembershipSerializer(members, many=True).data
    return Response(data)


# ────────────────────────────
# JOIN GROUP
# ────────────────────────────
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def join_group(request, group_id):
    try:
        group = ChatGroup.objects.get(id=group_id)
    except ChatGroup.DoesNotExist:
        return Response({"error": "Group not found"}, status=404)

    membership, created = Membership.objects.get_or_create(
        user=request.user, group=group, defaults={"role": "member"}
    )
    if not created:
        return Response({"message": "Already a member"}, status=200)
    return Response({"message": f"Joined {group.name}"}, status=201)


# ────────────────────────────
# LEAVE GROUP
# ────────────────────────────
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def leave_group(request, group_id):
    try:
        membership = Membership.objects.get(user=request.user, group_id=group_id)
    except Membership.DoesNotExist:
        return Response({"error": "Not a member"}, status=400)

    membership.delete()
    return Response({"message": "Left group"}, status=200)


# ────────────────────────────
# MY GROUPS
# ────────────────────────────
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_groups(request):
    if request.user.is_staff:
        # Admins automatically see all groups in their sidebar
        groups = ChatGroup.objects.all()
    else:
        memberships = Membership.objects.filter(user=request.user).select_related("group")
        groups = [m.group for m in memberships]
    
    serializer = ChatGroupSerializer(groups, many=True, context={"request": request})
    return Response(serializer.data)


# ────────────────────────────
# MESSAGE HISTORY (paginated)
# ────────────────────────────
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def message_history(request, group_id):
    # Admins can bypass membership check
    if not request.user.is_staff:
        if not Membership.objects.filter(user=request.user, group_id=group_id).exists():
            return Response({"error": "Not a member of this group"}, status=403)

    messages = Message.objects.filter(group_id=group_id).order_by("-timestamp")

    paginator = MessagePagination()
    page = paginator.paginate_queryset(messages, request)
    serializer = MessageSerializer(page, many=True)
    return paginator.get_paginated_response(serializer.data)


# ────────────────────────────
# DELETE MESSAGE (admin only)
# ────────────────────────────
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_message(request, message_id):
    try:
        message = Message.objects.get(id=message_id)
    except Message.DoesNotExist:
        return Response({"error": "Message not found"}, status=404)

    # Only message sender, group admin, or superuser can delete
    membership = Membership.objects.filter(user=request.user, group=message.group).first()
    is_admin = membership and membership.role == "admin"
    is_sender = message.sender == request.user

    if not (is_admin or is_sender or request.user.is_superuser):
        return Response({"error": "Permission denied"}, status=403)

    message.delete()
    return Response({"message": "Deleted"}, status=200)
