from django.urls import path
from .views import ExpenseListCreateView, ExpenseDeleteUpdateView

urlpatterns = [
    path("", ExpenseListCreateView.as_view()),
    path("<int:pk>/", ExpenseDeleteUpdateView.as_view()),
]
