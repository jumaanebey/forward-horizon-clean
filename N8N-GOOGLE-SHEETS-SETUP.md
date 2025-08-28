# N8N Google Sheets Integration Setup

## Step 1: Create Google Sheets Spreadsheet

1. Go to [sheets.google.com](https://sheets.google.com)
2. Create a new spreadsheet called "Forward Horizon Form Submissions"
3. Set up columns in Row 1:
   - A1: `Timestamp`
   - B1: `Form Type`
   - C1: `Name`
   - D1: `Email`
   - E1: `Phone`
   - F1: `Message`
   - G1: `Source`
   - H1: `Additional Data`

4. Copy the spreadsheet URL (you'll need the ID from it)

## Step 2: Set up Google Sheets in N8N

### Option A: Google Sheets Node (Recommended)

1. In your N8N workflow, click the **+** button after your Webhook node
2. Search for and select **Google Sheets**
3. Choose **Append** operation
4. Click **Connect my account** and authorize Google Sheets access
5. Configure the node:
   - **Document ID**: Paste your spreadsheet URL and N8N will extract the ID
   - **Sheet**: Sheet1 (or whatever you named it)
   - **Columns**: Map the data like this:
     ```
     Timestamp: {{$json.body.timestamp}}
     Form Type: {{$json.body.formType}}
     Name: {{$json.body.name}}
     Email: {{$json.body.email}}
     Phone: {{$json.body.phone}}
     Message: {{$json.body.message || $json.body.interests || $json.body.currentSituation}}
     Source: {{$json.body.source}}
     Additional Data: {{JSON.stringify($json.body)}}
     ```

### Option B: HTTP Request to Google Sheets API

If the Google Sheets node doesn't work, use HTTP Request:

1. Add **HTTP Request** node after Webhook
2. Configure:
   - **Method**: POST
   - **URL**: `https://sheets.googleapis.com/v4/spreadsheets/YOUR_SHEET_ID/values/Sheet1:append?valueInputOption=RAW`
   - **Authentication**: OAuth2
   - **Body**: 
     ```json
     {
       "values": [
         [
           "{{$json.body.timestamp}}",
           "{{$json.body.formType}}",
           "{{$json.body.name}}",
           "{{$json.body.email}}",
           "{{$json.body.phone}}",
           "{{$json.body.message || $json.body.interests || $json.body.currentSituation}}",
           "{{$json.body.source}}",
           "{{JSON.stringify($json.body)}}"
         ]
       ]
     }
     ```

## Step 3: Update Your N8N Workflow

Your complete workflow should look like this:

```
Webhook → Google Sheets → Send Email
```

1. **Webhook**: Receives form data
2. **Google Sheets**: Logs to spreadsheet  
3. **Send Email**: Sends notification email

## Step 4: Test the Integration

1. **Test in N8N**:
   - Click **Test workflow**
   - Use the test data or submit a form from your website

2. **Check Google Sheets**:
   - Verify new row appears with form data
   - Check that all columns are populated correctly

3. **Test Email**:
   - Confirm email notifications still work after adding Sheets node

## Step 5: Advanced Google Sheets Setup (Optional)

### Create Separate Sheets by Form Type

1. Add **IF** node after Webhook to route different form types:
   ```
   {{$json.body.formType === "application"}} → Application Sheet
   {{$json.body.formType === "contact"}} → Contact Sheet  
   {{$json.body.formType === "volunteer"}} → Volunteer Sheet
   ```

2. Create multiple Google Sheets nodes, one for each form type

### Add Data Validation and Formatting

1. In Google Sheets, add data validation:
   - **Form Type**: Data validation list (application, contact, volunteer)
   - **Email**: Email validation
   - **Phone**: Phone number formatting

2. Add conditional formatting:
   - Red for urgent applications
   - Green for completed follow-ups

## Troubleshooting

### Common Issues:

1. **"Insufficient permissions"**
   - Re-authorize Google Sheets connection
   - Ensure spreadsheet is accessible

2. **Data not appearing**
   - Check column mapping in N8N
   - Verify spreadsheet ID is correct

3. **Workflow timing out**
   - Add **Wait** node between Google Sheets and Email
   - Increase timeout settings

### Testing Commands:

Test your webhook with curl:
```bash
curl -X POST https://jumaanebey.app.n8n.cloud/webhook-test/forward-horizon-forms \
  -H "Content-Type: application/json" \
  -d '{
    "body": {
      "formType": "test",
      "name": "Test User",
      "email": "test@example.com",
      "phone": "(555) 123-4567",
      "message": "Testing Google Sheets integration",
      "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
      "source": "manual_test"
    }
  }'
```

## Final Workflow Structure

```
Webhook (Listen for forms)
    ↓
Google Sheets (Log data)  
    ↓
Send Email (Notify team)
```

This gives you:
- ✅ Automated form logging
- ✅ Easy data analysis in Sheets
- ✅ Email notifications preserved
- ✅ Complete audit trail

## Next Steps

1. Set up the Google Sheets as described above
2. Test with a form submission
3. Verify data appears in both Sheets and email
4. Set up any additional formatting or analysis in Sheets

Let me know if you need help with any of these steps!