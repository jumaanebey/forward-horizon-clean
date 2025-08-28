#!/bin/bash

# Test N8N Webhook with proper data
curl -X POST https://jumaanebey.app.n8n.cloud/webhook-test/forward-horizon-forms \
  -H "Content-Type: application/json" \
  -d '{
    "body": {
      "formType": "contact",
      "name": "John Doe",
      "email": "johndoe@example.com",
      "phone": "(555) 123-4567",
      "message": "I am interested in learning more about your transitional housing program for veterans."
    }
  }'

echo ""
echo "✅ Test data sent to N8N webhook!"