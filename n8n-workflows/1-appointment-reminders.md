# Workflow 1: Appointment Reminder System

## Overview
Automatically schedule appointments from form submissions, add to calendar, send SMS/email reminders, and track attendance.

## Workflow Components

### Step 1: Webhook Trigger
```json
{
  "name": "Appointment Request",
  "type": "webhook",
  "path": "/appointment-request",
  "method": "POST"
}
```

### Step 2: Validate & Parse Data
**IF Node** - Check required fields:
- Name
- Phone
- Email  
- Preferred Date/Time
- Appointment Type (Assessment, Follow-up, Placement)

### Step 3: Google Calendar Integration
**Google Calendar Node:**
- **Operation**: Create Event
- **Calendar**: Forward Horizon Appointments
- **Event Details**:
  ```
  Title: {{appointmentType}} - {{veteranName}}
  Start: {{preferredDateTime}}
  Duration: 1 hour
  Description: 
    Veteran: {{veteranName}}
    Phone: {{phone}}
    Email: {{email}}
    Type: {{appointmentType}}
    Notes: {{additionalNotes}}
  Location: {{location || "Forward Horizon Office"}}
  ```
- **Add Attendees**: Veteran email + Case worker email
- **Send Notifications**: Yes
- **Add Reminder**: 24 hours before

### Step 4: Create Confirmation Message
**Code Node** - Generate personalized message:
```javascript
const appointmentDate = new Date($json.preferredDateTime);
const formattedDate = appointmentDate.toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});

const message = {
  sms: `Hi ${$json.veteranName}, your ${$json.appointmentType} appointment is confirmed for ${formattedDate} at Forward Horizon. Reply CANCEL to cancel or RESCHEDULE to change. Call (310) 488-5280 with questions.`,
  
  email: {
    subject: `Appointment Confirmed: ${$json.appointmentType} on ${formattedDate}`,
    body: `
Dear ${$json.veteranName},

Your appointment has been confirmed:

📅 Date: ${formattedDate}
📍 Location: ${$json.location || 'Forward Horizon - 123 Main St, Los Angeles, CA'}
📋 Type: ${$json.appointmentType}

What to bring:
- Photo ID
- DD-214 (if first appointment)
- Any relevant documentation
- List of questions

Need to reschedule? Call us at (310) 488-5280 or reply to this email.

We look forward to seeing you!

Best regards,
Forward Horizon Team
    `
  }
};

return message;
```

### Step 5: Send Confirmations
**Parallel Branches:**

**Branch 1 - SMS via Twilio:**
- To: {{phone}}
- Body: {{message.sms}}
- From: Your Twilio number

**Branch 2 - Email:**
- To: {{email}}
- Subject: {{message.email.subject}}
- Body: {{message.email.body}}

### Step 6: Schedule Reminder (24 hours before)
**Wait Node:**
- Resume: At specific time
- Time: {{appointmentDate - 24 hours}}

**Then Send Reminder:**
- SMS: "Reminder: Your appointment is tomorrow at {time}. Reply CONFIRM to confirm attendance."
- Email: Similar reminder with appointment details

### Step 7: Track Response
**Webhook Node** - Listen for SMS replies:
- CONFIRM → Update calendar event with "Confirmed"
- CANCEL → Delete calendar event, notify staff
- RESCHEDULE → Trigger rescheduling workflow

### Step 8: Day-of Reminder (2 hours before)
**Wait Node:**
- Resume: {{appointmentDate - 2 hours}}

**Send Final Reminder:**
- SMS: "Your appointment is in 2 hours at Forward Horizon. See you soon!"

### Step 9: No-Show Follow-up
**Wait Node:**
- Resume: {{appointmentDate + 1 hour}}

**Check Attendance:**
- If marked as no-show in calendar
- Send follow-up: "We missed you today. Please call (310) 488-5280 to reschedule."
- Create task for case worker to follow up

## Implementation in N8N

1. **Create New Workflow** in N8N dashboard
2. **Add Webhook trigger node**
3. **Connect Google Calendar** (requires OAuth)
4. **Set up Twilio** (requires account SID & auth token)
5. **Configure email** (use existing SMTP)
6. **Add wait nodes** for scheduling
7. **Test with sample data**

## Environment Variables Needed
```env
# Add to your .env file
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
GOOGLE_CALENDAR_ID=your_calendar_id
APPOINTMENT_WEBHOOK_URL=https://jumaanebey.app.n8n.cloud/webhook/appointments
```

## Testing the Workflow

Test command:
```bash
curl -X POST https://jumaanebey.app.n8n.cloud/webhook/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "veteranName": "John Smith",
    "phone": "+13105551234",
    "email": "john.smith@example.com",
    "appointmentType": "Initial Assessment",
    "preferredDateTime": "2025-01-30T14:00:00",
    "location": "Forward Horizon Main Office",
    "additionalNotes": "Needs wheelchair access"
  }'
```

## Metrics to Track
- Appointment confirmation rate
- No-show rate
- Reminder effectiveness
- Response rates to SMS
- Average time to reschedule

## Next Steps
Once this is working, we can:
1. Add video appointment options (Zoom integration)
2. Integrate with case management system
3. Add automated intake form sending
4. Create appointment preparation checklists
5. Generate appointment summary reports

Ready to implement this in your N8N instance?