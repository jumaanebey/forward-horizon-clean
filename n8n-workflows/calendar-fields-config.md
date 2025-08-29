# Google Calendar Additional Fields Configuration

## Essential Fields to Add:

### 1. **Description** ✅ (Most Important)
Add this to provide appointment details:
```
Appointment Type: {{ $json.body.appointmentType }}
Veteran: {{ $json.body.veteranName }}
Phone: {{ $json.body.phone }}
Email: {{ $json.body.email }}
Notes: {{ $json.body.additionalNotes || 'None' }}

Preparation Required:
- Bring photo ID
- DD-214 if first visit
- List of current medications
- Emergency contact info
```

### 2. **Location** ✅
```
{{ $json.body.location || 'Forward Horizon - 1234 Veterans Way, Los Angeles, CA 90001' }}
```

### 3. **Attendees** ✅
Add the veteran as an attendee to send them calendar invite:
```
{{ $json.body.email }}
```
*This will automatically send them a Google Calendar invite*

### 4. **Send Updates** ✅
Select: **"All"**
*This ensures attendees get notified of any changes*

### 5. **Summary** (Optional - same as Title)
```
{{ $json.body.appointmentType }} - {{ $json.body.veteranName }}
```

### 6. **Show Me As** 
Select: **"Busy"**
*Blocks the time on calendar*

### 7. **Guests Can Modify**
Select: **"False"**
*Prevents veterans from changing appointment details*

### 8. **Guests Can See Other Guests**
Select: **"False"**  
*Privacy - veterans can't see other appointments*

### 9. **Color Name or ID** (Optional but helpful)
Use colors to categorize appointment types:
```
{{ $json.body.appointmentType === 'Initial Assessment' ? '9' : $json.body.appointmentType === 'Follow-up' ? '10' : '11' }}
```
- 9 = Blue (Initial Assessment)
- 10 = Green (Follow-up)
- 11 = Red (Urgent/Crisis)

## Fields to Skip:
- **All Day**: Leave unchecked (appointments have specific times)
- **Conference Data**: Skip unless doing video calls
- **Repeat Frequency**: Skip (appointments are one-time)
- **Max Attendees**: Not needed
- **Visibility**: Default is fine

## Complete Configuration Example:

**Required Fields:**
- Title: `{{ $json.body.appointmentType }} - {{ $json.body.veteranName }}`
- Start: `{{ $json.body.preferredDateTime }}`
- End: `{{ new Date(new Date($json.body.preferredDateTime).getTime() + 3600000).toISOString() }}`

**Additional Fields to Add:**
1. Description: (detailed info above)
2. Location: `{{ $json.body.location || 'Forward Horizon Office' }}`
3. Attendees: `{{ $json.body.email }}`
4. Send Updates: "All"
5. Show Me As: "Busy"
6. Guests Can Modify: False
7. Guests Can See Other Guests: False

## Test Data for These Fields:
```json
{
  "body": {
    "veteranName": "John Smith",
    "phone": "+13105551234",
    "email": "john.test@gmail.com",
    "appointmentType": "Initial Assessment",
    "preferredDateTime": "2025-01-31T14:00:00-08:00",
    "location": "Forward Horizon Main Office",
    "additionalNotes": "Needs wheelchair accessible entrance"
  }
}
```

## Pro Tips:
1. **Test with your own email first** to see how the invite looks
2. **Use color coding** to quickly identify appointment types in calendar
3. **Description field** is what appears in the email invite - make it helpful
4. **Location** with full address enables map links in calendar apps

After adding these fields, test the workflow to ensure the calendar event is created properly!