# Debug N8N Workflow Errors

## How to Find the Exact Error:

### 1. **Check Individual Nodes**
Click on each node and look for red error indicators:
- Red outline = node has configuration error
- Orange warning = potential issue

### 2. **Common Issues to Check:**

#### **IF Node:**
- Make sure the condition is properly set
- Left Value: `{{ $json.body.veteranName }}`
- Operation: "is not empty" 
- No right value needed

#### **Google Calendar Node:**
- **Start date format**: Make sure it's a valid ISO date
- **End date**: Must be after start date
- **Calendar selection**: Must be a valid calendar
- **Attendees**: Should be just `{{ $json.body.email }}` (no extra text)

#### **Twilio SMS Nodes:**
- **From**: Must be your verified Twilio phone number
- **To**: Must be in format `+1234567890`
- **Credentials**: Must be properly connected

#### **Email Node:**
- **From Email**: Must be valid email address
- **To Email**: `{{ $json.body.email }}`
- **Subject**: Can't be empty
- **SMTP credentials**: Must be connected

### 3. **Quick Debug Steps:**

#### **Step 1: Test Each Node Individually**
1. Click on **Google Calendar node**
2. Click **"Test step"** or **"Execute node"**
3. Look for any error messages

#### **Step 2: Check Expression Syntax**
Look for these common expression errors:
- Missing `{{` or `}}`
- Typos in field names
- Wrong date formats

#### **Step 3: Simplify to Find Issue**
Start simple:
1. **Disconnect all nodes** after Google Calendar
2. **Test just:** Webhook → IF → Google Calendar
3. **If that works**, add SMS
4. **If that works**, add Email
5. **Add Wait node last**

### 4. **Most Likely Issues:**

#### **Calendar Date Problem:**
Your `preferredDateTime` might be in wrong format. Try:
```
2025-01-30T14:00:00-08:00
```

#### **SMS From/To Still Wrong:**
Both SMS nodes should be:
- **From:** `(310) 488-5280` (your Twilio number)
- **To:** `{{ $json.body.phone }}` (veteran's number)

#### **Email Subject Empty:**
Change subject to:
```
Video Appointment Confirmed: {{ $json.body.appointmentType }}
```

#### **Expression Errors:**
Look for any expressions that might have syntax errors

### 5. **Test Data That Should Work:**
```json
{
  "body": {
    "veteranName": "John Test",
    "phone": "+13105551234",
    "email": "john@example.com",
    "appointmentType": "Initial Assessment",
    "preferredDateTime": "2025-01-30T14:00:00.000Z"
  }
}
```

### 6. **Emergency Simplification:**
If still having issues, create this minimal working version:

**Just these nodes:**
1. **Manual Trigger** (instead of webhook)
2. **Set** node with test data
3. **Google Calendar** (minimal config)

**Calendar minimal config:**
- Title: `Test Appointment`
- Start: `2025-01-30T14:00:00.000Z`
- End: `2025-01-30T15:00:00.000Z`

Get that working first, then add complexity.

## Next Steps:
1. **Click each node** and look for red errors
2. **Tell me which node shows errors**
3. **Share the specific error message**
4. We'll fix them one by one

The error message should tell us exactly what's wrong!