# Configure Google Drive Trigger for Forward Horizon

## Current Setup Analysis:
You have a Google Drive trigger watching the "AI_Folder" for new files. Let's customize this for Forward Horizon's needs.

## Recommended Configuration Changes:

### 1. Change the Folder
Instead of "AI_Folder", create/select:
- **"Forward_Horizon_Intake"** - for new veteran applications
- **"Document_Requests"** - for document generation requests
- **"New_Approvals"** - for approved veterans needing welcome packets

### 2. Workflow Trigger Options:

#### Option A: File-Based Trigger (Current)
Keep the Google Drive trigger to monitor when:
- Staff uploads veteran approval documents
- Case managers add intake forms
- New resident files are added

#### Option B: Webhook Trigger (Recommended)
Change to webhook for more control:
- Triggered from your website when veterans apply
- Triggered when staff marks someone as "approved"
- More reliable and immediate

## Recommended Setup for Forward Horizon:

### Replace Google Drive Trigger with Webhook:
1. **Delete the Google Drive trigger node**
2. **Add Webhook node** instead
3. **Configure webhook path**: `/generate-welcome-packet`

### New Workflow Structure:
```
Webhook (veteran approved) →
Code (generate welcome letter) →
Create Google Doc (welcome letter) →
Save to Google Drive →
Send Email (to veteran + case manager)
```

### Test Webhook Data:
```json
{
  "veteranName": "John Smith",
  "email": "john.smith@example.com",
  "phone": "(555) 123-4567",
  "moveInDate": "February 15, 2025",
  "roomAssignment": "Room 12A",
  "caseManager": "Sarah Johnson",
  "emergencyContact": "Jane Smith - (555) 987-6543"
}
```

## Benefits of Webhook vs File Trigger:
- ✅ **Immediate**: No 1-minute polling delay
- ✅ **Reliable**: No missed files or permission issues
- ✅ **Data-rich**: Structured veteran information
- ✅ **Testable**: Easy to test with curl commands
- ✅ **Integrated**: Works with your existing website forms

## Alternative: Keep File Trigger But Customize:

### If you prefer file monitoring:
1. **Change folder** to something like "New_Veterans"
2. **Staff process**: Upload veteran data as JSON/CSV when approved
3. **Workflow reads file** and generates documents
4. **Less immediate** but might fit existing processes

## My Recommendation:
**Switch to webhook trigger** - it's more reliable and integrates better with your existing form system.

Want me to help you:
1. **Replace with webhook trigger**?
2. **Keep file trigger but customize the folder**?
3. **Set up both options**?