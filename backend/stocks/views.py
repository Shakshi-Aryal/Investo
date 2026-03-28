from django.http import JsonResponse
from nepse_data_api import Nepse
from .models import Stock, Watchlist
from datetime import date

# Initialize NEPSE with cache
nepse = Nepse(cache_ttl=60, enable_cache=True)

def safe_fetch_and_store(api_call, *args, **kwargs):
    """Helper to try API, save results to DB, and return DB data if API fails."""
    try:
        return api_call(*args, **kwargs)
    except Exception as e:
        print(f"API Error: {e}")
        return None

# 🔹 Main Stocks View
def stocks(request):
    live_data = safe_fetch_and_store(nepse.get_stocks)
    if live_data:
        for item in live_data:
            Stock.objects.update_or_create(
                symbol=item.get('symbol'),
                defaults={
                    'last_traded_price': item.get('lastTradedPrice'),
                    'percentage_change': item.get('percentageChange', 0.0)
                }
            )
    db_stocks = list(Stock.objects.all().values('symbol', 'last_traded_price', 'percentage_change'))
    return JsonResponse(db_stocks, safe=False)

# 🔹 Reversible Watchlist Toggle
def toggle_watchlist(request):
    symbol = request.GET.get("symbol", "").upper()
    if not symbol: return JsonResponse({"error": "No symbol"}, status=400)
    obj, created = Watchlist.objects.get_or_create(symbol=symbol)
    if not created:
        obj.delete()
        return JsonResponse({"status": "removed"})
    return JsonResponse({"status": "added"})

def get_watchlist(request):
    watch_symbols = Watchlist.objects.values_list('symbol', flat=True)
    data = list(Stock.objects.filter(symbol__in=watch_symbols).values())
    return JsonResponse(data, safe=False)

def status(request):
    data = safe_fetch_and_store(nepse.get_market_status) or {"isOpen": False, "note": "Offline"}
    return JsonResponse(data, safe=False)

# 🔹 FIXED: Mapping Top Gainers
def gainers(request):
    raw_data = safe_fetch_and_store(nepse.get_top_gainers, limit=5) or []
    standardized = []
    for item in raw_data:
        standardized.append({
            "symbol": item.get("symbol") or item.get("stockSymbol"),
            "percentageChange": item.get("percentageChange") or item.get("pointChange") or 0
        })
    return JsonResponse(standardized, safe=False)

# 🔹 FIXED: Mapping Top Losers
def losers(request):
    raw_data = safe_fetch_and_store(nepse.get_top_losers, limit=5) or []
    standardized = []
    for item in raw_data:
        standardized.append({
            "symbol": item.get("symbol") or item.get("stockSymbol"),
            "percentageChange": item.get("percentageChange") or item.get("pointChange") or 0
        })
    return JsonResponse(standardized, safe=False)

# 🔹 FIXED: Mapping Chart Data
def chart(request):
    symbol = request.GET.get("symbol", "NABIL")
    today = date.today().strftime("%Y-%m-%d")
    raw_chart = safe_fetch_and_store(nepse.get_historical_chart, symbol, start_date="2025-01-01", end_date=today) or []
    
    # Handle cases where API returns a dict instead of a list
    if isinstance(raw_chart, dict):
        raw_chart = raw_chart.get('graphData') or raw_chart.get('data') or []
        
    return JsonResponse(raw_chart, safe=False)

# Standard Pass-throughs
def summary(request): return JsonResponse(safe_fetch_and_store(nepse.get_market_summary) or {}, safe=False)
def sectors(request): return JsonResponse(safe_fetch_and_store(nepse.get_sub_indices) or [], safe=False)
def news(request): return JsonResponse(safe_fetch_and_store(nepse.get_company_news) or [], safe=False)
def depth(request): return JsonResponse(safe_fetch_and_store(nepse.get_market_depth) or {}, safe=False)
def floorsheet(request): return JsonResponse(safe_fetch_and_store(nepse.get_floorsheet) or [], safe=False)