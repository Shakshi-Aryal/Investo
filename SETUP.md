# Investo — Setup & Run Guide

## Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL running on localhost:5432
- Redis running on localhost:6379
- MongoDB running on localhost:27017 (optional, for activity logging)

---

## Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Seed the stock market data (generates 20 stocks + 6 months of candle history)
python manage.py seed_market_data

# Start Django (ASGI via Daphne for WebSocket support)
daphne -b 0.0.0.0 -p 8000 investo_backend.asgi:application
```

### Start Celery Worker (in a separate terminal)
```bash
cd backend
celery -A investo_backend worker --loglevel=info
```

### Start Celery Beat Scheduler (in a separate terminal)
```bash
cd backend
celery -A investo_backend beat --loglevel=info --scheduler django_celery_beat.schedulers:DatabaseScheduler
```

---

## Frontend Setup

```bash
cd frontend/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

App runs at: http://localhost:5173

---

## What Was Fixed

### Critical Bug Fixes
1. **App.jsx circular import crash** — `App.jsx` was importing itself (`import App from "./App"`). Fixed by removing the self-import and using a proper landing redirect.
2. **Missing MainLayout** — `MarketDashboard`, `StockDetail`, and `Notifications` pages were missing the `MainLayout` wrapper (no sidebar/navbar).
3. **CandlestickChart broken indicator API** — Wrong URL format (`?type=sma` instead of `?indicators=sma`). Fixed with correct endpoint.
4. **SimulationEngine state loss** — A new `SimulationEngine` was created on every Celery task call, losing all trend state. Fixed with a module-level singleton.
5. **USE_TZ=False incompatibility** — `timezone.now()` calls throughout the codebase were incompatible with `USE_TZ=False`. Fixed to use `datetime.now()`.
6. **Stockcharts.jsx broken API calls** — Was calling old non-existent endpoints. Now redirects to the new `/market` page.

### New Features Added
- **MarketDashboard**: Full MainLayout, search, sector filter, sort controls, tab switcher (All/Gainers/Losers/Active), sector performance cards, most active sidebar
- **StockDetail**: Watchlist toggle button, price alert modal, active alerts list, full stats grid
- **CandlestickChart**: Fixed SMA/EMA/Bollinger Bands indicator toggle with correct API calls
- **Notifications**: Full MainLayout, filter tabs (All/Unread/Alerts/Reminders/Market), type icons/colors, mark-as-read on click

---

## Architecture Overview

```
Backend (Django + Channels + Celery)
├── stocks/          — Market simulation, OHLC data, watchlist, alerts
├── notifications/   — Unified notification system (in-app + email + WebSocket)
├── reminders/       — Scheduled reminder emails
├── accounts/        — JWT auth + Google OAuth
├── community/       — Real-time chat
└── portfolio_management/ — Investment tracking

Frontend (React + Vite + Tailwind)
├── pages/MarketDashboard.jsx  — Market overview with live updates
├── pages/StockDetail.jsx      — Individual stock with chart + alerts
├── pages/Notifications.jsx    — Notification center
├── components/market/CandlestickChart.jsx — TradingView Lightweight Charts
└── hooks/useMarketWebSocket.js — Real-time WebSocket hook

Real-time Flow:
Celery Beat (every 5s) → simulate_market_tick → Redis Channel Layer → WebSocket → React
```
