from django.urls import path
from . import views

urlpatterns = [
    path("groups/", views.group_list_create, name="group_list_create"),
    path("groups/<int:group_id>/", views.group_detail, name="group_detail"),
    path("groups/<int:group_id>/join/", views.join_group, name="join_group"),
    path("groups/<int:group_id>/leave/", views.leave_group, name="leave_group"),
    path("groups/<int:group_id>/messages/", views.message_history, name="message_history"),
    path("my-groups/", views.my_groups, name="my_groups"),
    path("messages/<int:message_id>/delete/", views.delete_message, name="delete_message"),
]
