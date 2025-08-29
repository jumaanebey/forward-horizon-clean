# Fix N8N Workflow Issues

## Problem: Nodes Not Connected Properly

### Step 1: Fix the IF Node Configuration

In your **IF node**, you need to configure the conditions properly:

1. Click on the **IF node**
2. In the conditions section:
   - **Left Value**: Click the field and type: `{{ $json.body.veteranName }}`
   - **Operation**: Select "is not empty" from dropdown
   - **Right Value**: Leave empty (not needed for "is not empty")

3. Click **Add Condition** to add more checks:
   - `{{ $json.body.phone }}` - is not empty
   - `{{ $json.body.email }}` - is not empty
   - `{{ $json.body.appointmentType }}` - is not empty

### Step 2: Connect IF Node to Google Calendar

The IF node has TWO outputs:
- **TRUE** (green) - when conditions are met
- **FALSE** (red) - when conditions fail

**Connect the TRUE output to Google Calendar:**
1. Click and drag from the TRUE (green) output of IF node
2. Connect to the input of Google Calendar node

### Step 3: Fix Google Calendar Configuration

**Update these fields in Google Calendar node:**

**Calendar**: 
- First, click "Select a Calendar..." 
- Choose your calendar from the list

**Title**: 
```
{{ $json.body.appointmentType }} - {{ $json.body.veteranName }}
```

**Start**: Replace the current value with:
```
{{ $json.body.preferredDateTime }}
```

**End**: Replace with:
```
{{ new Date(new Date($json.body.preferredDateTime).getTime() + 3600000).toISOString() }}
```

**Description**: Add in Additional Fields:
1. Click "Add Field"
2. Select "Description"
3. Add:
```
Veteran: {{ $json.body.veteranName }}
Phone: {{ $json.body.phone }}
Email: {{ $json.body.email }}
Notes: {{ $json.body.additionalNotes || 'None' }}
```

### Step 4: Test with Mock Data

1. Click on the **Webhook node**
2. Click "Listen for Test Event"
3. In another terminal/window, run this test:

```bash
curl -X POST https://jumaanebey.app.n8n.cloud/webhook/845740ee-45df-4f49-9cf5-35c092045a9d \
  -H "Content-Type: application/json" \
  -d '{
    "body": {
      "veteranName": "John Test",
      "phone": "+13105551234",
      "email": "test@example.com",
      "appointmentType": "Initial Assessment",
      "preferredDateTime": "2025-01-30T14:00:00-08:00",
      "additionalNotes": "Testing appointment system"
    }
  }'
```

### Step 5: Alternative - Use Set Node for Testing

If webhook testing is difficult, add a **Set node** before the IF node:

1. Add a **Manual Trigger** node at the start
2. Add a **Set** node after it
3. Configure Set node with test data:
   - veteranName: "Test User"
   - phone: "+13105551234"
   - email: "test@example.com"
   - appointmentType: "Assessment"
   - preferredDateTime: "2025-01-30T14:00:00"

4. Connect: Manual Trigger → Set → IF → Google Calendar

### Visual Flow Should Be:

```
Webhook → IF (check fields) → TRUE → Google Calendar → Twilio SMS → Send Email → Wait
                            ↓ 
                          FALSE → (handle error)
```

### Common Issues & Fixes:

**"Calendar not found"**
- Make sure you've connected your Google account
- Select a specific calendar from the dropdown

**"Invalid date"**
- Ensure preferredDateTime is in ISO format
- Use the expression editor to format dates properly

**"Node not connected"**
- Each node must receive input from the previous node
- Check all connections are from output to input

**Still having issues?** 
- Click "Execute Workflow" to see exactly where it fails
- Check the execution log for specific error messages
- Use the "Test" button on individual nodes

Let me know what error you're seeing now and I'll help fix it!