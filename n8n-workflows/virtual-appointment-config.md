# Virtual Appointment Configuration

## Updated Google Calendar Fields for Virtual Appointments

### 1. **Location** - Update to Virtual
```
{{ $json.body.appointmentType === 'Virtual' || $json.body.isVirtual ? 'Virtual Meeting - Link will be sent via email' : 'Forward Horizon - 1234 Veterans Way, Los Angeles, CA 90001' }}
```

Or simpler if ALL appointments are virtual:
```
Virtual Meeting - Phone/Video Call
```

### 2. **Description** - Add Virtual Meeting Info
```
VIRTUAL APPOINTMENT
================
Join by Phone: (310) 488-5280
Or Video Link: Will be sent 1 hour before appointment

Appointment Type: {{ $json.body.appointmentType }}
Veteran: {{ $json.body.veteranName }}
Phone: {{ $json.body.phone }}
Email: {{ $json.body.email }}
Notes: {{ $json.body.additionalNotes || 'None' }}

What to Prepare:
- Have your ID ready to verify identity
- Find a quiet, private space
- Test your phone/computer audio before the call
- Have any documents ready to share
- Prepare your questions

Can't make it? Call (310) 488-5280 to reschedule
```

### 3. **Conference Data** (Optional - for Video Calls)
If you want to automatically add Google Meet:

Click "Add Field" → **Conference Data**
- **Create Conference**: Toggle ON
- This automatically creates a Google Meet link

### 4. **Update SMS Message for Virtual**
In your Twilio SMS node, update message:
```
Hi {{ $json.body.veteranName }}, your VIRTUAL {{ $json.body.appointmentType }} appointment is confirmed for {{ new Date($json.body.preferredDateTime).toLocaleString('en-US', {dateStyle: 'full', timeStyle: 'short'}) }}. You'll receive a call at {{ $json.body.phone }}. Reply CANCEL to cancel. Call (310) 488-5280 with questions.
```

### 5. **Update Email for Virtual Appointments**
In your Send Email node:
```
Subject: Virtual Appointment Confirmed: {{ $json.body.appointmentType }}

Dear {{ $json.body.veteranName }},

Your VIRTUAL appointment has been confirmed:

📅 Date: {{ new Date($json.body.preferredDateTime).toLocaleString('en-US', {dateStyle: 'full', timeStyle: 'short'}) }}
📞 Format: Phone/Video Call
☎️ We'll call you at: {{ $json.body.phone }}

How it works:
1. We'll call you at your scheduled time
2. Have your ID ready for verification
3. Find a quiet, private space
4. The appointment will last approximately 45-60 minutes

What to prepare:
- List of current medications
- Your DD-214 (have it nearby)
- Any questions you want to discuss
- Emergency contact information

Need to reschedule? Call (310) 488-5280

We look forward to speaking with you!

Forward Horizon Team
```

## Options for Video Appointments

### Option A: Google Meet (Easiest)
- Enable Conference Data in Google Calendar node
- Meet link automatically created and sent

### Option B: Zoom Integration
Add a Zoom node after Google Calendar:
1. Create Zoom meeting
2. Add meeting link to calendar description
3. Send link in confirmation email

### Option C: Phone Only
- Keep it simple with phone appointments
- Add phone number to location field
- Clear instructions in description

## Updated Test Data for Virtual Appointments
```json
{
  "body": {
    "veteranName": "Jane Doe",
    "phone": "+13105551234",
    "email": "jane.test@gmail.com",
    "appointmentType": "Initial Assessment",
    "preferredDateTime": "2025-01-31T14:00:00-08:00",
    "isVirtual": true,
    "additionalNotes": "Prefers phone call over video"
  }
}
```

## Virtual Appointment Reminder (24 hours before)
Add this to your reminder SMS/Email:
```
Reminder: Your VIRTUAL appointment is tomorrow at {{ time }}. We'll call you at {{ $json.body.phone }}. Have your ID ready. Reply CONFIRM to confirm you'll be available.
```

## Day-Of Reminder (1 hour before)
```
Your virtual appointment starts in 1 hour. We'll call you at {{ $json.body.phone }}. Find a quiet space and have your documents ready. Text READY when you're prepared.
```

Would you like me to help you set up Google Meet integration for automatic video links, or keep it simple with phone appointments?