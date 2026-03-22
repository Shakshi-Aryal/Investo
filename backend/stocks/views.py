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

# 🔹 Main Stocks View: Syncs API data into local Database
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
    
    # Always serve from DB so it works offline/closed market
    db_stocks = list(Stock.objects.all().values('symbol', 'last_traded_price', 'percentage_change'))
    return JsonResponse(db_stocks, safe=False)

# 🔹 Reversible Watchlist Toggle
def toggle_watchlist(request):
    symbol = request.GET.get("symbol", "").upper()
    if not symbol:
        return JsonResponse({"error": "No symbol provided"}, status=400)
    
    obj, created = Watchlist.objects.get_or_create(symbol=symbol)
    if not created:
        # If it already existed, we remove it (the "Reversible" part)
        obj.delete()
        return JsonResponse({"status": "removed"})
    return JsonResponse({"status": "added"})

# 🔹 Get items currently in Watchlist with latest prices
def get_watchlist(request):
    watch_symbols = Watchlist.objects.values_list('symbol', flat=True)
    data = list(Stock.objects.filter(symbol__in=watch_symbols).values())
    return JsonResponse(data, safe=False)

# 🔹 Market Status
def status(request):
    data = safe_fetch_and_store(nepse.get_market_status) or {"isOpen": False, "note": "Showing Offline Data"}
    return JsonResponse(data, safe=False)

# 🔹 Top Gainers/Losers
def gainers(request):
    return JsonResponse(safe_fetch_and_store(nepse.get_top_gainers, limit=5) or [], safe=False)

def losers(request):
    return JsonResponse(safe_fetch_and_store(nepse.get_top_losers, limit=5) or [], safe=False)

# 🔹 Chart Data
def chart(request):
    symbol = request.GET.get("symbol", "NABIL")
    today = date.today().strftime("%Y-%m-%d")
    data = safe_fetch_and_store(nepse.get_historical_chart, symbol, start_date="2025-01-01", end_date=today) or []
    return JsonResponse(data, safe=False)

# 🔹 Standard Pass-throughs
def summary(request): return JsonResponse(safe_fetch_and_store(nepse.get_market_summary) or {}, safe=False)
def sectors(request): return JsonResponse(safe_fetch_and_store(nepse.get_sub_indices) or [], safe=False)
def news(request): return JsonResponse(safe_fetch_and_store(nepse.get_company_news) or [], safe=False)
def depth(request): return JsonResponse(safe_fetch_and_store(nepse.get_market_depth) or {}, safe=False)
def floorsheet(request): return JsonResponse(safe_fetch_and_store(nepse.get_floorsheet) or [], safe=False)