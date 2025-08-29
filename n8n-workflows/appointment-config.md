# Appointment Reminder Workflow Configuration

## Node 1: Webhook
Already configured ✓
- Path: `845740ee-45df-4f49-9cf5-35c092045a9d`
- Full URL: `https://jumaanebey.app.n8n.cloud/webhook/845740ee-45df-4f49-9cf5-35c092045a9d`

## Node 2: IF (Validation)
Configure the conditions to check required fields:

**Condition 1:**
- Left Value: `{{ $json.body.veteranName }}`
- Operation: `is not empty`

**Add more conditions (AND):**
- `{{ $json.body.phone }}` - is not empty
- `{{ $json.body.email }}` - is not empty  
- `{{ $json.body.preferredDateTime }}` - is not empty
- `{{ $json.body.appointmentType }}` - is not empty

## Node 3: Google Calendar - Create Event
**Connect Google Account first**, then configure:

- **Calendar**: Select "Forward Horizon" or your main calendar
- **Title**: `{{ $json.body.appointmentType }} - {{ $json.body.veteranName }}`
- **Start**: `{{ $json.body.preferredDateTime }}`
- **End**: `{{ new Date(new Date($json.body.preferredDateTime).getTime() + 60*60*1000).toISOString() }}`
- **Description**: 
```
Veteran: {{ $json.body.veteranName }}
Phone: {{ $json.body.phone }}
Email: {{ $json.body.email }}
Type: {{ $json.body.appointmentType }}
Notes: {{ $json.body.additionalNotes }}
```
- **Location**: `{{ $json.body.location || "Forward Horizon Office" }}`
- **Send Updates**: All
- **Add Guests**: `{{ $json.body.email }}`

## Node 4: Twilio SMS
**First, get Twilio credentials:**
1. Sign up at twilio.com (free trial)
2. Get Account SID, Auth Token, and Phone Number
3. Add credentials in N8N

**Configure node:**
- **From**: Your Twilio phone number
- **To**: `{{ $json.body.phone }}`
- **Message**: 
```
Hi {{ $json.body.veteranName }}, your {{ $json.body.appointmentType }} appointment is confirmed for {{ new Date($json.body.preferredDateTime).toLocaleString('en-US', {dateStyle: 'full', timeStyle: 'short'}) }} at Forward Horizon. Reply CANCEL to cancel. Call (310) 488-5280 with questions.
```

## Node 5: Send Email
Using your existing SMTP credentials ✓

- **To**: `{{ $json.body.email }}`
- **Subject**: `Appointment Confirmed: {{ $json.body.appointmentType }}`
- **Text**:
```
Dear {{ $json.body.veteranName }},

Your appointment has been confirmed:

Date: {{ new Date($json.body.preferredDateTime).toLocaleString('en-US', {dateStyle: 'full', timeStyle: 'short'}) }}
Location: {{ $json.body.location || "Forward Horizon Office" }}
Type: {{ $json.body.appointmentType }}

What to bring:
- Photo ID
- DD-214 (if first appointment)
- Any relevant documentation

Need to reschedule? Call (310) 488-5280

We look forward to seeing you!

Forward Horizon Team
```

## Node 6: Wait (24-hour reminder)
Configure the Wait node:

- **Resume**: At Specified Time
- **Date & Time**: `{{ new Date(new Date($json.body.preferredDateTime).getTime() - 24*60*60*1000).toISOString() }}`

## Add After Wait Node:
**Add another SMS node** after Wait for the reminder:
- Same Twilio config
- **Message**: `Reminder: Your {{ $json.body.appointmentType }} appointment is tomorrow at {{ new Date($json.body.preferredDateTime).toLocaleString('en-US', {timeStyle: 'short'}) }}. Call (310) 488-5280 if you need to reschedule.`

## Testing Data
Use this in the webhook test:
```json
{
  "body": {
    "veteranName": "Test Veteran",
    "phone": "+13105551234",
    "email": "test@example.com",
    "appointmentType": "Initial Assessment",
    "preferredDateTime": "2025-01-31T14:00:00",
    "location": "Forward Horizon Main Office",
    "additionalNotes": "First time visit"
  }
}
```

## Update Your Website Form
Add appointment booking to your application.html:

```javascript
// Add this to your form submission
if (formData.appointmentRequested) {
  fetch('https://jumaanebey.app.n8n.cloud/webhook/845740ee-45df-4f49-9cf5-35c092045a9d', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      body: {
        veteranName: formData.name,
        phone: formData.phone,
        email: formData.email,
        appointmentType: 'Initial Assessment',
        preferredDateTime: formData.preferredDate,
        additionalNotes: formData.message
      }
    })
  });
}
```

Ready to test it? Need help with any specific node configuration?