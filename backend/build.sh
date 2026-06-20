#!/usr/bin/env bash
# exit on error
set -o errexit

echo ">>> Building React Frontend..."
cd frontend
npm install
npm run build
cd ..

echo ">>> Installing Python Backend dependencies..."
pip install --upgrade pip
pip install -r backend/requirements.txt

echo ">>> Build script completed successfully!"
