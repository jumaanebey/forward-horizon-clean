# Virtual Appointment Configuration - Both Phone & Video Options

## Updated Node Configuration for Choice

### 1. **IF Node - Add Meeting Type Check**
After your existing validation IF node, add another IF to handle meeting type:

**Condition:**
- Left Value: `{{ $json.body.meetingType || 'phone' }}`
- Operation: equals
- Right Value: `video`

This splits the flow: Phone appointments (FALSE) vs Video appointments (TRUE)

### 2. **Google Calendar - Phone Appointments (FALSE branch)**

**Location:**
```
Virtual Meeting - Phone Call
We'll call you at {{ $json.body.phone }}
```

**Description:**
```
PHONE APPOINTMENT
================
We'll call you at: {{ $json.body.phone }}
Please answer when we call at the scheduled time.

Appointment Details:
- Type: {{ $json.body.appointmentType }}
- Veteran: {{ $json.body.veteranName }}
- Duration: 45-60 minutes

Preparation:
✓ Find a quiet, private space
✓ Have your ID ready to verify identity
✓ Keep documents nearby (DD-214, medical records, etc.)
✓ Prepare your questions
✓ Ensure good phone reception

We'll call you exactly at the scheduled time.
Questions? Call (310) 488-5280
```

### 3. **Google Calendar - Video Appointments (TRUE branch)**

**Location:**
```
Virtual Meeting - Video Call (Google Meet)
```

**Conference Data:** 
- Toggle **Create Conference** ON (creates Google Meet automatically)

**Description:**
```
VIDEO APPOINTMENT
================
Google Meet link: Will be included in calendar invite

Appointment Details:
- Type: {{ $json.body.appointmentType }}
- Veteran: {{ $json.body.veteranName }}
- Duration: 45-60 minutes

Before the meeting:
✓ Test your camera and microphone
✓ Find a quiet, well-lit space
✓ Have your ID ready to show on camera
✓ Keep documents nearby to share if needed
✓ Use Chrome browser for best experience

Backup: If video fails, we'll call you at {{ $json.body.phone }}
Questions? Call (310) 488-5280
```

### 4. **SMS Messages - Different for Each Type**

**Phone Appointment SMS (FALSE branch):**
```
Hi {{ $json.body.veteranName }}, your PHONE appointment is confirmed for {{ new Date($json.body.preferredDateTime).toLocaleString('en-US', {dateStyle: 'full', timeStyle: 'short'}) }}. We'll call you at {{ $json.body.phone }}. Find a quiet space. Reply CANCEL to cancel or READY when prepared.
```

**Video Appointment SMS (TRUE branch):**
```
Hi {{ $json.body.veteranName }}, your VIDEO appointment is confirmed for {{ new Date($json.body.preferredDateTime).toLocaleString('en-US', {dateStyle: 'full', timeStyle: 'short'}) }}. Google Meet link sent via email. Test your camera/mic first. Reply CANCEL to cancel or PHONE for phone backup.
```

### 5. **Email Messages - Customized**

**Phone Appointment Email:**
```
Subject: Phone Appointment Confirmed: {{ $json.body.appointmentType }}

Dear {{ $json.body.veteranName }},

Your PHONE appointment has been confirmed:

📅 Date: {{ new Date($json.body.preferredDateTime).toLocaleString('en-US', {dateStyle: 'full', timeStyle: 'short'}) }}
📞 Format: Phone Call
☎️ We'll call you at: {{ $json.body.phone }}

How it works:
1. We'll call you at exactly the scheduled time
2. Please answer the call - it may show as "Unknown" or our main number
3. Have your ID ready for verification
4. Find a quiet, private space for confidentiality

What to prepare:
- Your DD-214 (have it nearby)
- List of current medications
- Questions you want to discuss
- Emergency contact information

Need to reschedule or switch to video? Call (310) 488-5280

We look forward to speaking with you!
Forward Horizon Team
```

**Video Appointment Email:**
```
Subject: Video Appointment Confirmed: {{ $json.body.appointmentType }}

Dear {{ $json.body.veteranName }},

Your VIDEO appointment has been confirmed:

📅 Date: {{ new Date($json.body.preferredDateTime).toLocaleString('en-US', {dateStyle: 'full', timeStyle: 'short'}) }}
📹 Format: Video Call (Google Meet)
🔗 Meeting Link: Included in the calendar invite below

Before your appointment:
1. Click the Google Meet link in your calendar
2. Test your camera and microphone (click the gear icon in Meet)
3. Use Chrome browser for the best experience
4. Find a quiet, well-lit space
5. Have your ID ready to show on camera

Tech support needed? 
- Call us at (310) 488-5280 before your appointment
- We can switch to phone if video doesn't work
- Backup: We'll call you at {{ $json.body.phone }} if needed

We look forward to seeing you!
Forward Horizon Team
```

## 6. **Update Your Website Form**

Add meeting preference to your form:

```html
<div class="form-group">
    <label>Appointment Type:</label>
    <select name="meetingType" required>
        <option value="phone">Phone Call (we'll call you)</option>
        <option value="video">Video Call (Google Meet)</option>
    </select>
</div>
```

## 7. **Updated Test Data**

**Phone Appointment Test:**
```json
{
  "body": {
    "veteranName": "John Smith",
    "phone": "+13105551234",
    "email": "john.test@gmail.com",
    "appointmentType": "Initial Assessment",
    "preferredDateTime": "2025-01-31T14:00:00-08:00",
    "meetingType": "phone",
    "additionalNotes": "Prefers phone calls"
  }
}
```

**Video Appointment Test:**
```json
{
  "body": {
    "veteranName": "Jane Doe",
    "phone": "+13105559876",
    "email": "jane.test@gmail.com",
    "appointmentType": "Follow-up Meeting",
    "preferredDateTime": "2025-01-31T15:00:00-08:00",
    "meetingType": "video",
    "additionalNotes": "Has good internet connection"
  }
}
```

## 8. **Workflow Structure**

```
Webhook → Validation IF → Meeting Type IF
                              ↓           ↓
                          Phone        Video
                         Branch       Branch
                              ↓           ↓
                      Phone Calendar  Video Calendar
                              ↓           ↓
                       Phone SMS    Video SMS
                              ↓           ↓
                      Phone Email  Video Email
                              ↓           ↓
                            Wait       Wait
                         (24hr)     (24hr)
                              ↓           ↓
                    Phone Reminder  Video Reminder
```

## 9. **Pro Tips**

**For Veterans:**
- Always provide phone backup for video calls
- Clear instructions for first-time video users
- Test links ahead of time

**For Staff:**
- Monitor which option is preferred
- Have phone backup ready during video calls
- Track technical issues for improvements

Want me to help you set up the branching logic in N8N?