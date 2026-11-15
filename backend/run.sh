#!/bin/sh
# Starts the API on all interfaces so a phone on the same Wi-Fi can reach it.
cd "$(dirname "$0")"
[ -d .venv ] || python3 -m venv .venv
. .venv/bin/activate
pip install -q -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
