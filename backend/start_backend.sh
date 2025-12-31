#!/bin/bash
cd /Users/maxrosul/ratingAPP/backend
source venv/bin/activate
python -m uvicorn app.main:app --reload --port 8000
