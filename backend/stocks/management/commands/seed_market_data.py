"""
Management command to seed the simulated stock market database.

Usage:
    python manage.py seed_market_data
    python manage.py seed_market_data --days 90
    python manage.py seed_market_data --clear
"""
from django.core.management.base import BaseCommand
from stocks.services.seed_data import run_full_seed
from stocks.models import Stock, CandleData, MarketIndex


class Command(BaseCommand):
    help = 'Seed the database with simulated NEPSE-style stock market data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=180,
            help='Number of days of historical data to generate (default: 180)',
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear all existing market data before seeding',
        )

    def handle(self, *args, **options):
        days = options['days']

        if options['clear']:
            self.stdout.write(self.style.WARNING('Clearing existing market data...'))
            CandleData.objects.all().delete()
            MarketIndex.objects.all().delete()
            Stock.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('OK Cleared all market data'))

        self.stdout.write(self.style.NOTICE(f'Seeding {days} days of market data...'))
        self.stdout.write('This may take a moment...\n')

        run_full_seed(days=days)

        self.stdout.write(self.style.SUCCESS(
            f'\nOK Successfully seeded market data!\n'
            f'   Stocks: {Stock.objects.count()}\n'
            f'   Candles: {CandleData.objects.count()}\n'
            f'   Index entries: {MarketIndex.objects.count()}'
        ))
