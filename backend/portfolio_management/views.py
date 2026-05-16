from decimal import Decimal

from django.conf import settings as django_settings
from django.db import transaction
from django.db.models import Sum
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.models import Profile
from stocks.models import Stock
from .models import Portfolio
from .serializers import PortfolioSerializer

DEFAULT_TRADING_BALANCE = Decimal('500000.00')


class PortfolioViewSet(viewsets.ModelViewSet):

    serializer_class = PortfolioSerializer
    permission_classes = [permissions.IsAuthenticated]

    @staticmethod
    def _sync_market_holdings(user):
        """Refresh stock holding valuations from live simulated prices."""
        holdings = Portfolio.objects.filter(
            user=user,
            investment_type='stocks_digital',
        ).exclude(stock_symbol='')

        for holding in holdings:
            try:
                stock = Stock.objects.get(symbol=holding.stock_symbol, is_active=True)
            except Stock.DoesNotExist:
                continue
            qty = holding.quantity or 1
            holding.investment_amount = round(float(stock.current_price) * qty, 2)
            holding.save(update_fields=['investment_amount', 'roi'])

    def get_queryset(self):
        if self.action in ('list', 'retrieve', 'summary', 'allocation'):
            self._sync_market_holdings(self.request.user)
        return Portfolio.objects.filter(user=self.request.user).order_by('-id')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def wallet(self, request):
        profile, _ = Profile.objects.get_or_create(
            user=request.user,
            defaults={'trading_balance': DEFAULT_TRADING_BALANCE},
        )
        return Response({'trading_balance': str(profile.trading_balance)})

    @action(detail=False, methods=['post'])
    def buy_stock(self, request):
        """
        Purchase NEPSE shares: deduct trading_balance, merge holding, no page reload needed on client.
        """
        symbol = (request.data.get('symbol') or '').strip().upper()
        try:
            shares = float(request.data.get('shares', 0))
        except (TypeError, ValueError):
            return Response({'detail': 'Invalid shares.'}, status=status.HTTP_400_BAD_REQUEST)

        if not symbol or shares <= 0:
            return Response(
                {'detail': 'symbol and shares are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            stock = Stock.objects.get(symbol=symbol, is_active=True)
        except Stock.DoesNotExist:
            return Response({'detail': f'Stock {symbol} not found.'}, status=status.HTTP_404_NOT_FOUND)

        price_per_share = float(stock.current_price)
        cost = Decimal(str(round(shares * price_per_share, 2)))
        company = stock.company_name or symbol

        with transaction.atomic():
            profile, _ = Profile.objects.select_for_update().get_or_create(
                user=request.user,
                defaults={'trading_balance': DEFAULT_TRADING_BALANCE},
            )
            balance = Decimal(str(profile.trading_balance))

            if balance < cost:
                return Response(
                    {
                        'detail': 'Insufficient trading balance.',
                        'trading_balance': str(balance),
                        'required': str(cost),
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            profile.trading_balance = balance - cost
            profile.save(update_fields=['trading_balance'])

            holding = Portfolio.objects.filter(
                user=request.user,
                stock_symbol=symbol,
                investment_type='stocks_digital',
            ).first()

            if holding:
                holding.quantity = (holding.quantity or 0) + shares
                holding.total_capital = round(holding.total_capital + float(cost), 2)
                holding.investment_amount = round(float(stock.current_price) * holding.quantity, 2)
                holding.investment_name = f"{symbol} ({holding.quantity:g} kitta)"
                holding.save()
                created = False
            else:
                holding = Portfolio.objects.create(
                    user=request.user,
                    investment_name=f"{symbol} — {company}",
                    investment_type='stocks_digital',
                    stock_symbol=symbol,
                    quantity=shares,
                    total_capital=float(cost),
                    investment_amount=float(cost),
                    estimated_return_per_year=10,
                    time_period=1,
                )
                created = True

        try:
            from notifications.services import create_notification
            create_notification(
                user=request.user,
                notification_type='system',
                title=f'Stock purchase: {symbol}',
                message=(
                    f'You acquired {shares:g} kitta of {symbol} at Rs. {price_per_share:,.2f} '
                    f'(total Rs. {float(cost):,.2f}).'
                ),
                metadata={
                    'action': 'transaction',
                    'symbol': symbol,
                    'shares': shares,
                    'cost': float(cost),
                },
                send_email=getattr(django_settings, 'EMAIL_ON_TRANSACTIONS', False),
            )
        except Exception:
            pass

        serializer = PortfolioSerializer(holding)
        return Response(
            {
                **serializer.data,
                'created': created,
                'purchase_cost': float(cost),
                'price_per_share': price_per_share,
                'trading_balance': str(profile.trading_balance),
            },
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

    @action(detail=False, methods=['get'])
    def summary(self, request):
        portfolio = Portfolio.objects.filter(user=request.user)
        total_capital = portfolio.aggregate(Sum('total_capital'))['total_capital__sum'] or 0
        total_value = portfolio.aggregate(Sum('investment_amount'))['investment_amount__sum'] or 0
        profit = total_value - total_capital
        roi = (profit / total_capital * 100) if total_capital > 0 else 0
        return Response({
            'total_capital': total_capital,
            'portfolio_value': total_value,
            'profit_loss': profit,
            'roi': roi,
        })

    @action(detail=False, methods=['get'])
    def allocation(self, request):
        portfolio = Portfolio.objects.filter(user=request.user)
        by_type = {}
        for item in portfolio:
            key = item.investment_type
            by_type.setdefault(key, {'amount': 0, 'count': 0})
            by_type[key]['amount'] += item.investment_amount
            by_type[key]['count'] += 1
        data = [
            {
                'investment_type': key,
                'investment_amount': meta['amount'],
                'count': meta['count'],
            }
            for key, meta in by_type.items()
        ]
        return Response(data)
