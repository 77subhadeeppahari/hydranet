"""
Passenger WSGI entry point for cPanel Python Passenger hosting.
FastAPI is ASGI; a2wsgi bridges it for Passenger's WSGI runner.
"""
import sys
import os

# Make sure the app directory is on the path
sys.path.insert(0, os.path.dirname(__file__))

from a2wsgi import ASGIMiddleware
from server import app as fastapi_app

# 'application' is the name Passenger looks for
application = ASGIMiddleware(fastapi_app)
