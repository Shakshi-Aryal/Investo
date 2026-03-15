from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum

from .models import Portfolio
from .serializers import PortfolioSerializer


class PortfolioViewSet(viewsets.ModelViewSet):

    serializer_class = PortfolioSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Portfolio.objects.filter(user=self.request.user).order_by("-id")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    # Portfolio summary endpoint
    @action(detail=False, methods=['get'])
    def summary(self, request):

        portfolio = Portfolio.objects.filter(user=request.user)

        total_capital = portfolio.aggregate(Sum('total_capital'))['total_capital__sum'] or 0
        total_value = portfolio.aggregate(Sum('investment_amount'))['investment_amount__sum'] or 0

        profit = total_value - total_capital

        roi = (profit / total_capital * 100) if total_capital > 0 else 0

        return Response({
            "total_capital": total_capital,
            "portfolio_value": total_value,
            "profit_loss": profit,
            "roi": roi
        })

    # Pie chart data endpoint
    @action(detail=False, methods=['get'])
    def allocation(self, request):

        portfolio = Portfolio.objects.filter(user=request.user)

        data = [
            {
                "investment_name": item.investment_name,
                "investment_amount": item.investment_amount
            }
            for item in portfolio
        ]

        return Response(data)