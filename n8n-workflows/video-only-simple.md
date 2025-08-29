# Simple Video Chat Only Configuration

## Google Calendar Node - Video Only Setup

Keep your current single workflow, just update these fields:

### **Location Field:**
```
Virtual Meeting - Video Call
```

### **Conference Data:**
Click "Add Field" → **Conference Data**
- Toggle **Create Conference** to **ON**
- This automatically creates Google Meet links

### **Description Field:**
```
VIDEO APPOINTMENT
================
Google Meet link: Included in calendar invite

Appointment Type: {{ $json.body.appointmentType }}
Veteran: {{ $json.body.veteranName }}
Phone: {{ $json.body.phone }}
Email: {{ $json.body.email }}

Before joining:
- Click the Meet link in your calendar
- Test camera/microphone first
- Find a quiet, well-lit space
- Have your ID ready to show

Backup: If video fails, call (310) 488-5280
```

### **SMS Message (Twilio Node):**
```
Hi {{ $json.body.veteranName }}, your VIDEO appointment is confirmed for {{ new Date($json.body.preferredDateTime).toLocaleString('en-US', {dateStyle: 'full', timeStyle: 'short'}) }}. Google Meet link sent via email. Test your camera first. Reply CANCEL to cancel.
```

### **Email Message:**
```
Subject: Video Appointment Confirmed: {{ $json.body.appointmentType }}

Dear {{ $json.body.veteranName }},

Your video appointment is confirmed:

📅 Date: {{ new Date($json.body.preferredDateTime).toLocaleString('en-US', {dateStyle: 'full', timeStyle: 'short'}) }}
📹 Format: Video Call via Google Meet
🔗 Meeting Link: Check your calendar invite below

Before your appointment:
1. Click the Google Meet link in your calendar
2. Use Chrome browser for best experience
3. Test your camera and microphone
4. Find a quiet, well-lit space
5. Have your ID ready to show

Backup: If you have technical issues, call (310) 488-5280

We look forward to seeing you!
Forward Horizon Team
```

## That's It!
Just those simple changes to your existing workflow. Google Meet link gets created automatically and sent to the veteran.

Much simpler and works perfectly for virtual appointments!