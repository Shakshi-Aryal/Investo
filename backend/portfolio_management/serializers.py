from rest_framework import serializers
from .models import Portfolio


class PortfolioSerializer(serializers.ModelSerializer):

    investment_type_display = serializers.CharField(
        source='get_investment_type_display',
        read_only=True,
    )

    class Meta:
        model = Portfolio
        fields = [
            'id', 'investment_name', 'investment_type', 'investment_type_display',
            'stock_symbol', 'quantity', 'total_capital', 'investment_amount',
            'estimated_return_per_year', 'time_period', 'roi', 'user',
        ]
        read_only_fields = ['user', 'roi', 'investment_type_display']
