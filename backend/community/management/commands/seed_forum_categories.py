"""
Management command to seed default forum categories.
Run once after migration: python manage.py seed_forum_categories
"""
from django.core.management.base import BaseCommand
from community.models import ForumCategory


CATEGORIES = [
    {"name": "Stocks",               "slug": "stocks",               "icon": "📈", "color": "#26a69a", "description": "Discuss NEPSE stocks, analysis, and trading strategies.", "order": 1},
    {"name": "Crypto",               "slug": "crypto",               "icon": "₿",  "color": "#FF9800", "description": "Bitcoin, Ethereum, altcoins and DeFi discussions.", "order": 2},
    {"name": "Beginner Investing",   "slug": "beginner-investing",   "icon": "🌱", "color": "#4CAF50", "description": "New to investing? Ask questions and learn the basics.", "order": 3},
    {"name": "Financial News",       "slug": "financial-news",       "icon": "📰", "color": "#2196F3", "description": "Share and discuss the latest financial news.", "order": 4},
    {"name": "Portfolio Reviews",    "slug": "portfolio-reviews",    "icon": "💼", "color": "#9C27B0", "description": "Share your portfolio for community feedback.", "order": 5},
    {"name": "Investment Strategies","slug": "investment-strategies","icon": "🎯", "color": "#E91E63", "description": "Long-term, short-term, value investing and more.", "order": 6},
    {"name": "Market Analysis",      "slug": "market-analysis",      "icon": "🔍", "color": "#FF5722", "description": "Technical and fundamental analysis discussions.", "order": 7},
    {"name": "General Discussion",   "slug": "general",              "icon": "💬", "color": "#607D8B", "description": "Off-topic finance chat and community announcements.", "order": 8},
]


class Command(BaseCommand):
    help = "Seed default forum categories"

    def handle(self, *args, **options):
        created = 0
        for cat in CATEGORIES:
            _, was_created = ForumCategory.objects.get_or_create(
                slug=cat["slug"], defaults=cat
            )
            if was_created:
                created += 1
                self.stdout.write(self.style.SUCCESS(f"  Created: {cat['name']}"))
            else:
                self.stdout.write(f"  Exists:  {cat['name']}")

        self.stdout.write(self.style.SUCCESS(f"\nDone — {created} categories created."))
