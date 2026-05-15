from django.apps import AppConfig


class StocksConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'stocks'

    def ready(self):
        import os
        import sys
        import threading
        import time

        # Skip running thread during migrations, seeding, or other management commands
        is_manage_py = any('manage.py' in arg for arg in sys.argv)
        if is_manage_py and 'runserver' not in sys.argv:
            return

        # Double check to prevent starting in the auto-reloader parent process in local dev
        if is_manage_py and 'runserver' in sys.argv:
            if os.environ.get('RUN_MAIN') != 'true':
                return

        def run_simulation_loop():
            # Let the database connections initialize
            time.sleep(3)
            
            count = 0
            while True:
                try:
                    # 1. Run catch-up dynamically
                    from stocks.services.catch_up import catch_up_market
                    catch_up_market()

                    # 2. Trigger live price simulation tick
                    from stocks.tasks import simulate_market_tick, check_price_alerts
                    simulate_market_tick()

                    # 3. Check price alerts every 2 ticks (10s)
                    if count % 2 == 0:
                        check_price_alerts()

                    count += 1
                except Exception as e:
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.debug(f"[EMBEDDED SIMULATOR] Error in tick: {e}")
                
                time.sleep(5)

        # Start the background thread
        thread = threading.Thread(target=run_simulation_loop, daemon=True)
        thread.start()

