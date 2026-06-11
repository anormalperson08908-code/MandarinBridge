# MandarinBridge Admin Manual

## System Overview

MandarinBridge is a Flask-based web application with:
- SQLite database for user and lesson data
- Session-based authentication
- RESTful API endpoints

## Deployment Management

### Checking System Status
```bash
# Check if app is running
curl https://yourdomain.com/api/health

# Expected response:
{"status":"ok","project":"MandarinBridge"}