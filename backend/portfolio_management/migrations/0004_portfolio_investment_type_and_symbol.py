# Generated manually for Investo portfolio multi-asset tracking

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('portfolio_management', '0003_remove_portfolio_expected_return_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='portfolio',
            name='investment_type',
            field=models.CharField(
                choices=[
                    ('stocks_digital', 'Stocks / Digital Assets'),
                    ('real_estate', 'Real Estate'),
                    ('cash', 'Cash & Liquidity'),
                    ('precious_metals', 'Gold / Silver'),
                    ('other_physical', 'Other Physical'),
                ],
                default='stocks_digital',
                max_length=32,
            ),
        ),
        migrations.AddField(
            model_name='portfolio',
            name='stock_symbol',
            field=models.CharField(blank=True, default='', max_length=20),
        ),
        migrations.AddField(
            model_name='portfolio',
            name='quantity',
            field=models.FloatField(default=1.0),
        ),
    ]
