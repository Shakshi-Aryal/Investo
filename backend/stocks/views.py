"""
API Views for the Stock Market module.
Uses Django REST Framework with JWT authentication.
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.db.models import Avg, Sum, Count, Q
from datetime import datetime, timedelta
import calendar

from .models import Stock, CandleData, MarketIndex, UserWatchlist, PriceAlert
from .serializers import (
    StockListSerializer, StockDetailSerializer, CandleDataSerializer,
    MarketIndexSerializer, WatchlistSerializer, PriceAlertSerializer,
    SectorPerformanceSerializer,
)
from .services.technical_indicators import (
    calculate_sma, calculate_ema, calculate_rsi,
    calculate_macd, calculate_bollinger_bands,
)

from .services.catch_up import catch_up_market

# ──────────────────────────────────────────────
# MARKET OVERVIEW
# ──────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([AllowAny])
def market_overview(request):
    """
    Returns comprehensive market overview:
    - Market index
    - Top gainers / losers
    - Most active stocks
    - Sentiment
    """
    catch_up_market()
    index = MarketIndex.objects.first()
    index_data = MarketIndexSerializer(index).data if index else {}

    stocks = Stock.objects.filter(is_active=True)

    gainers = stocks.order_by('-percentage_change')[:5]
    gainers_data = StockListSerializer(gainers, many=True).data

    losers = stocks.order_by('percentage_change')[:5]
    losers_data = StockListSerializer(losers, many=True).data

    most_active = stocks.order_by('-volume')[:5]
    active_data = StockListSerializer(most_active, many=True).data

    advancing = stocks.filter(percentage_change__gt=0).count()
    declining = stocks.filter(percentage_change__lt=0).count()
    total = stocks.count()

    if total > 0:
        sentiment_score = (advancing - declining) / total
    else:
        sentiment_score = 0

    if sentiment_score > 0.3:
        sentiment = 'Bullish'
    elif sentiment_score < -0.3:
        sentiment = 'Bearish'
    else:
        sentiment = 'Neutral'

    return Response({
        'index': index_data,
        'top_gainers': gainers_data,
        'top_losers': losers_data,
        'most_active': active_data,
        'sentiment': {
            'label': sentiment,
            'score': round(sentiment_score, 2),
            'advancing': advancing,
            'declining': declining,
            'unchanged': total - advancing - declining,
        },
    })


# ──────────────────────────────────────────────
# STOCK LIST
# ──────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([AllowAny])
def stock_list(request):
    """
    Returns all active stocks with optional search/filter/sort.
    Query params: search, sector, sort_by, order
    """
    catch_up_market()
    stocks = Stock.objects.filter(is_active=True)

    search = request.query_params.get('search', '')
    if search:
        stocks = stocks.filter(
            Q(symbol__icontains=search) | Q(company_name__icontains=search)
        )

    sector = request.query_params.get('sector', '')
    if sector:
        stocks = stocks.filter(sector=sector)

    sort_by = request.query_params.get('sort_by', 'symbol')
    order = request.query_params.get('order', 'asc')
    valid_sort_fields = ['symbol', 'current_price', 'percentage_change', 'volume', 'market_cap']
    if sort_by in valid_sort_fields:
        if order == 'desc':
            sort_by = f'-{sort_by}'
        stocks = stocks.order_by(sort_by)

    serializer = StockListSerializer(stocks, many=True)
    return Response(serializer.data)


# ──────────────────────────────────────────────
# STOCK DETAIL
# ──────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([AllowAny])
def stock_detail(request, symbol):
    """Returns detailed info for a single stock."""
    catch_up_market()
    try:
        stock = Stock.objects.get(symbol=symbol.upper(), is_active=True)
    except Stock.DoesNotExist:
        return Response({'error': 'Stock not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = StockDetailSerializer(stock, context={'request': request})
    return Response(serializer.data)


# ──────────────────────────────────────────────
# CANDLE HISTORY
# ──────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([AllowAny])
def stock_history(request, symbol):
    """
    Returns OHLC candle data for charting.
    Query params: timeframe (1d default), period (1D, 1W, 1M, 3M, 6M)
    """
    catch_up_market()
    try:
        stock = Stock.objects.get(symbol=symbol.upper(), is_active=True)
    except Stock.DoesNotExist:
        return Response({'error': 'Stock not found'}, status=status.HTTP_404_NOT_FOUND)

    timeframe = request.query_params.get('timeframe', '1d')
    period = request.query_params.get('period', '6M')

    # USE_TZ=False so use datetime.now() not timezone.now()
    now = datetime.now()
    period_map = {
        '1D': timedelta(days=1),
        '1W': timedelta(weeks=1),
        '1M': timedelta(days=30),
        '3M': timedelta(days=90),
        '6M': timedelta(days=180),
    }
    delta = period_map.get(period, timedelta(days=180))
    start_date = now - delta

    candles = CandleData.objects.filter(
        stock=stock,
        timeframe=timeframe,
        timestamp__gte=start_date,
    ).order_by('timestamp')

    serializer = CandleDataSerializer(candles, many=True)
    return Response(serializer.data)


# ──────────────────────────────────────────────
# TECHNICAL INDICATORS
# ──────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([AllowAny])
def stock_indicators(request, symbol):
    """
    Compute technical indicators for a stock.
    Query params: indicators (comma-separated: sma,ema,rsi,macd,bollinger)
    """
    try:
        stock = Stock.objects.get(symbol=symbol.upper(), is_active=True)
    except Stock.DoesNotExist:
        return Response({'error': 'Stock not found'}, status=status.HTTP_404_NOT_FOUND)

    indicators_param = request.query_params.get('indicators', 'sma,ema,rsi,macd,bollinger')
    requested = [i.strip().lower() for i in indicators_param.split(',')]

    candles = CandleData.objects.filter(
        stock=stock, timeframe='1d'
    ).order_by('timestamp').values(
        'timestamp', 'open_price', 'high_price', 'low_price', 'close_price', 'volume'
    )

    candle_list = list(candles)
    for c in candle_list:
        c['time'] = int(calendar.timegm(c['timestamp'].timetuple()))

    result = {}
    sma_period = int(request.query_params.get('sma_period', 20))
    ema_period = int(request.query_params.get('ema_period', 20))
    rsi_period = int(request.query_params.get('rsi_period', 14))

    if 'sma' in requested:
        result['sma'] = calculate_sma(candle_list, period=sma_period)
    if 'ema' in requested:
        result['ema'] = calculate_ema(candle_list, period=ema_period)
    if 'rsi' in requested:
        result['rsi'] = calculate_rsi(candle_list, period=rsi_period)
    if 'macd' in requested:
        result['macd'] = calculate_macd(candle_list)
    if 'bollinger' in requested:
        result['bollinger'] = calculate_bollinger_bands(candle_list)

    return Response(result)


# ──────────────────────────────────────────────
# SECTOR PERFORMANCE
# ──────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([AllowAny])
def sector_performance(request):
    """Returns aggregated performance by sector."""
    sectors = Stock.objects.filter(is_active=True).values('sector').annotate(
        avg_change=Avg('percentage_change'),
        total_volume=Sum('volume'),
        stock_count=Count('id'),
    ).order_by('-avg_change')

    result = []
    sector_display = dict(Stock.SECTOR_CHOICES)
    for s in sectors:
        top = Stock.objects.filter(
            sector=s['sector'], is_active=True
        ).order_by('-percentage_change').first()

        result.append({
            'sector': s['sector'],
            'sector_display': sector_display.get(s['sector'], s['sector']),
            'avg_change': round(float(s['avg_change'] or 0), 2),
            'total_volume': s['total_volume'] or 0,
            'stock_count': s['stock_count'],
            'top_stock': top.symbol if top else '',
        })

    return Response(result)


# ──────────────────────────────────────────────
# WATCHLIST (Authenticated)
# ──────────────────────────────────────────────
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def watchlist_view(request):
    """GET: list user watchlist. POST: add stock to watchlist."""
    if request.method == 'GET':
        items = UserWatchlist.objects.filter(user=request.user).select_related('stock')
        serializer = WatchlistSerializer(items, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = WatchlistSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def watchlist_remove(request, stock_id):
    """Remove a stock from user's watchlist."""
    deleted, _ = UserWatchlist.objects.filter(user=request.user, stock_id=stock_id).delete()
    if deleted:
        return Response({'status': 'removed'})
    return Response({'error': 'Not in watchlist'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def watchlist_toggle(request):
    """Toggle a stock in/out of the watchlist. Accepts stock_id or symbol in body."""
    stock_id = request.data.get('stock_id')
    if not stock_id:
        symbol = request.data.get('symbol', '').upper()
        if symbol:
            try:
                stock_id = Stock.objects.get(symbol=symbol).id
            except Stock.DoesNotExist:
                return Response({'error': 'Stock not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response({'error': 'stock_id or symbol required'}, status=status.HTTP_400_BAD_REQUEST)

    existing = UserWatchlist.objects.filter(user=request.user, stock_id=stock_id)
    if existing.exists():
        existing.delete()
        return Response({'status': 'removed', 'is_watchlisted': False})
    else:
        UserWatchlist.objects.create(user=request.user, stock_id=stock_id)
        return Response({'status': 'added', 'is_watchlisted': True}, status=status.HTTP_201_CREATED)


# ──────────────────────────────────────────────
# PRICE ALERTS (Authenticated)
# ──────────────────────────────────────────────
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def alert_view(request):
    """GET: list user alerts. POST: create new alert."""
    if request.method == 'GET':
        alerts = PriceAlert.objects.filter(user=request.user).select_related('stock')
        serializer = PriceAlertSerializer(alerts, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = PriceAlertSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def alert_delete(request, alert_id):
    """Delete a price alert."""
    deleted, _ = PriceAlert.objects.filter(id=alert_id, user=request.user).delete()
    if deleted:
        return Response({'status': 'deleted'})
    return Response({'error': 'Alert not found'}, status=status.HTTP_404_NOT_FOUND)


# ──────────────────────────────────────────────
# MARKET STATUS
# ──────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([AllowAny])
def market_status(request):
    """Simple market status endpoint."""
    index = MarketIndex.objects.first()
    if index:
        return Response({'isOpen': index.is_market_open, 'note': 'Simulated market'})
    return Response({'isOpen': True, 'note': 'Simulated market'})
