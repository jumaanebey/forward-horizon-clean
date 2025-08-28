#!/bin/bash

# Test N8N Webhook
# Update the URL with your actual N8N webhook URL after setting it up

N8N_WEBHOOK_URL="https://your-instance.app.n8n.cloud/webhook-test/forward-horizon-forms"

curl -X POST $N8N_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{
    "formType": "contact",
    "name": "Test User",
    "email": "test@example.com",
    "phone": "(555) 123-4567",
    "message": "This is a test submission from Forward Horizon",
    "urgency": "normal",
    "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
  }'

echo ""
echo "Test sent! Check your N8N workflow to see if it received the data."