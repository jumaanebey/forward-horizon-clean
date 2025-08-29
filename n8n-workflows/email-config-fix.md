# Fix Email Node Configuration

## Send Email Node Settings

### **From Email:**
```
admin@theforwardhorizon.com
```
(Or whatever email you want to send from)

### **To Email:**
```
{{ $json.body.email }}
```
(This gets the veteran's email from the form data)

### **Subject:**
```
Video Appointment Confirmed: {{ $json.body.appointmentType }}
```

### **Email Format:**
Keep as **HTML**

### **HTML Content:**
```html
<p>Dear {{ $json.body.veteranName }},</p>

<p>Your <strong>VIDEO appointment</strong> has been confirmed:</p>

<ul>
<li>📅 <strong>Date:</strong> {{ new Date($json.body.preferredDateTime).toLocaleString('en-US', {dateStyle: 'full', timeStyle: 'short'}) }}</li>
<li>📹 <strong>Format:</strong> Video Call via Google Meet</li>
<li>🔗 <strong>Meeting Link:</strong> Check your calendar invite below</li>
</ul>

<h3>Before your appointment:</h3>
<ol>
<li>Click the Google Meet link in your calendar</li>
<li>Use Chrome browser for best experience</li>
<li>Test your camera and microphone</li>
<li>Find a quiet, well-lit space</li>
<li>Have your ID ready to show</li>
</ol>

<p><strong>Backup:</strong> If you have technical issues, call <strong>(310) 488-5280</strong></p>

<p>We look forward to seeing you!</p>

<p>Best regards,<br>
Forward Horizon Team</p>
```

## Wait Node Configuration

### **Resume Mode:**
Select: **"At Specified Time"**

### **Date & Time:**
```
{{ new Date(new Date($json.body.preferredDateTime).getTime() - 24*60*60*1000).toISOString() }}
```

This makes it wait until 24 hours before the appointment to send reminder.

## Missing: Add Reminder After Wait

After the Wait node, you need to add another **SMS node** for the 24-hour reminder:

### **Reminder SMS Configuration:**
- **From:** (310) 488-5280
- **To:** `{{ $json.body.phone }}`
- **Message:**
```
Reminder: Your VIDEO appointment with Forward Horizon is tomorrow at {{ new Date($json.body.preferredDateTime).toLocaleString('en-US', {timeStyle: 'short'}) }}. Google Meet link is in your email/calendar. Test your camera today. Questions? Call (310) 488-5280
```

## Complete Workflow Should Be:

```
Webhook → IF → Google Calendar → SMS → Email → Wait → Reminder SMS
```

## Test Data to Use:

```json
{
  "body": {
    "veteranName": "Test Veteran",
    "phone": "+13105551234",
    "email": "your-test-email@gmail.com",
    "appointmentType": "Initial Assessment",
    "preferredDateTime": "2025-01-30T14:00:00-08:00",
    "additionalNotes": "First appointment"
  }
}
```

Fix these settings and your appointment workflow will be complete!