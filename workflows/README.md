# Forward Horizon Automated Workflows

## 🎯 What This Does

Automatically generates professional documents for Forward Horizon veterans:
- **Welcome Letters** with personalized details
- **Housing Agreements** with terms and conditions  
- **Intake Checklists** for case managers
- **Saves everything** to Google Drive
- **Emails documents** to veterans automatically

## 🚀 Three Ways to Use This:

### Option 1: Standalone Server (Easiest)
Run as independent service without N8N:

```bash
cd workflows
npm install
npm start
```

Server runs on http://localhost:3001

### Option 2: Import to N8N
1. **Copy the workflow JSON** from `n8n-workflow-export.json`
2. **Import into N8N**: Settings → Import from JSON
3. **Connect your credentials** (Google Drive, Email)
4. **Activate the workflow**

### Option 3: Integrate with Your Website
Add to your existing approval process:

```javascript
// When veteran is approved
fetch('http://localhost:3001/generate-documents', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    name: "John Smith",
    email: "john@example.com", 
    moveInDate: "February 15, 2025",
    roomNumber: "Room 12A",
    caseManager: "Sarah Johnson"
  })
});
```

## 📋 Test the System

```bash
# Test document generation
npm test

# Or test with curl:
curl -X POST http://localhost:3001/generate-documents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "email": "john@example.com",
    "phone": "(555) 123-4567", 
    "moveInDate": "February 15, 2025",
    "roomNumber": "Room 12A",
    "caseManager": "Sarah Johnson",
    "emergencyContact": "Jane Smith - (555) 987-6543"
  }'
```

## 📁 What Gets Generated

For each veteran, you get:
1. **Professional welcome letter** with move-in details
2. **Housing agreement** ready for signatures
3. **Intake checklist** for case managers
4. **Automatic email** sent to veteran
5. **Files saved** to documents folder

## 🔧 Configuration

Edit the CONFIG section in `document-generator.js`:

```javascript
const CONFIG = {
  organization: "Forward Horizon Transitional Housing",
  phone: "(310) 488-5280", 
  email: "info@theforwardhorizon.com",
  address: "1234 Veterans Way, Los Angeles, CA 90001"
};
```

## 💰 Cost

- **Standalone server**: FREE
- **N8N integration**: FREE (self-hosted)
- **Google Drive API**: FREE (within generous limits)
- **Email sending**: Uses your existing email service

## 🎉 Benefits

- **Save 2-3 hours per veteran** in manual document creation
- **Professional, consistent documents** every time
- **Automatic delivery** to veterans
- **Organized filing** in Google Drive
- **Easy customization** for your specific needs

## 📞 Integration Options

**Website Integration:**
- Add to your approval workflow
- Trigger when veteran status changes to "approved"
- Integrate with your existing form system

**Manual Use:**
- Run when case manager approves veteran
- Use web interface for one-off document generation
- Perfect for existing workflow integration

## 🔄 Workflow Process

```
Veteran Approved → 
Generate Documents → 
Save to Google Drive → 
Email to Veteran → 
Notify Case Manager →
Ready for Move-in!
```

This system will save you hours of work and ensure every veteran gets professional, welcoming documentation!