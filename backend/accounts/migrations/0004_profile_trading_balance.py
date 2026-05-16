from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0003_profile_avatar'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='trading_balance',
            field=models.DecimalField(
                decimal_places=2,
                default=500000,
                help_text='Simulated NPR cash balance for market purchases',
                max_digits=14,
            ),
        ),
    ]
