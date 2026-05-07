#!/bin/bash

echo "Testing Pac-Man Backend Locally..."
echo ""

# Test health check
echo "1️⃣ Testing health endpoint:"
curl -X GET http://localhost:5000/api/health
echo ""
echo ""

# Test registration
echo "2️⃣ Testing registration:"
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
echo ""
echo ""

# Test login
echo "3️⃣ Testing login with same credentials:"
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
echo ""

echo "✅ Tests complete! Check output above."
