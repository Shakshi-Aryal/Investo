from pymongo import MongoClient
from django.conf import settings
import datetime

class MongoLogger:
    """
    Helper for FYP-required MongoDB integration.
    Used for logging market activity and system events.
    """
    def __init__(self):
        try:
            # Default to local mongo if no setting
            mongo_uri = getattr(settings, 'MONGODB_URI', 'mongodb://localhost:27017/')
            self.client = MongoClient(mongo_uri, serverSelectionTimeoutMS=2000)
            self.db = self.client.investo_logs
            self.collection = self.db.activity_log
        except Exception as e:
            print(f"[MongoDB] Connection Failed: {e}")
            self.collection = None

    def log_event(self, event_type, message, metadata=None):
        if not self.collection:
            return
        
        log_entry = {
            "timestamp": datetime.datetime.now(),
            "event_type": event_type,
            "message": message,
            "metadata": metadata or {}
        }
        try:
            self.collection.insert_one(log_entry)
        except Exception as e:
            print(f"[MongoDB] Log Error: {e}")

# Global singleton
mongo_logger = MongoLogger()
