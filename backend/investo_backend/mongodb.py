import datetime
import logging

from django.conf import settings
from pymongo import MongoClient

logger = logging.getLogger(__name__)


class MongoLogger:
    """Optional MongoDB activity logging."""

    def __init__(self):
        self.collection = None
        try:
            mongo_uri = getattr(settings, 'MONGO_URI', 'mongodb://localhost:27017/investo_logs')
            self.client = MongoClient(mongo_uri, serverSelectionTimeoutMS=2000)
            self.db = self.client.get_default_database()
            self.collection = self.db.activity_log
        except Exception as e:
            logger.warning('MongoDB connection failed: %s', e)

    def log_event(self, event_type, message, metadata=None):
        if not self.collection:
            return
        log_entry = {
            'timestamp': datetime.datetime.now(),
            'event_type': event_type,
            'message': message,
            'metadata': metadata or {},
        }
        try:
            self.collection.insert_one(log_entry)
        except Exception as e:
            logger.warning('MongoDB log error: %s', e)


mongo_logger = MongoLogger()
