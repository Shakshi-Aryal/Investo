from django.urls import path
from . import views

urlpatterns = [
    path("stocks/", views.stocks),
    path("status/", views.status),
    path("gainers/", views.gainers),
    path("losers/", views.losers),
    path("chart/", views.chart),
    path("summary/", views.summary),
    path("sectors/", views.sectors),
    path("news/", views.news),
    path("depth/", views.depth),
    path("floorsheet/", views.floorsheet),
    # New Watchlist Endpoints
    path("watchlist/toggle/", views.toggle_watchlist),
    path("watchlist/", views.get_watchlist),
]