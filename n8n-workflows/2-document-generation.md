# Workflow 2: Document Generation System

## Overview
Automatically generate personalized documents (welcome packets, leases, intake forms) when veterans are approved for housing.

## Why This Workflow?
- **Simple to build** - just webhook + document templates
- **Immediate time savings** - no more manual document creation  
- **Professional results** - consistent, branded documents
- **Easy to test** - generates PDFs you can see immediately

## Workflow Components

### Step 1: Webhook Trigger
```json
{
  "name": "Document Request",
  "path": "/generate-documents",  
  "method": "POST"
}
```

### Step 2: Document Template Generation
**Code Node** - Generate personalized documents:

```javascript
// Get veteran info from webhook
const veteran = $json.body;
const currentDate = new Date().toLocaleDateString();

// Welcome Letter Template
const welcomeLetter = `
<!DOCTYPE html>
<html>
<head>
    <title>Welcome to Forward Horizon</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; border-bottom: 2px solid #2c5530; padding: 20px 0; }
        .content { margin: 30px 0; line-height: 1.6; }
        .signature { margin-top: 40px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Forward Horizon Transitional Housing</h1>
        <p>Supporting Veterans on Their Journey to Independence</p>
    </div>
    
    <div class="content">
        <p><strong>Date:</strong> ${currentDate}</p>
        
        <p>Dear ${veteran.name},</p>
        
        <p>Welcome to Forward Horizon! We are honored to support you on your journey toward stable, independent living.</p>
        
        <p><strong>Your Housing Details:</strong></p>
        <ul>
            <li><strong>Move-in Date:</strong> ${veteran.moveInDate || 'To be scheduled'}</li>
            <li><strong>Room Assignment:</strong> ${veteran.roomNumber || 'Will be assigned'}</li>
            <li><strong>Program Duration:</strong> Up to 24 months</li>
            <li><strong>Case Manager:</strong> ${veteran.caseManager || 'Will be assigned'}</li>
        </ul>
        
        <p><strong>What to Bring on Move-In Day:</strong></p>
        <ul>
            <li>Valid photo ID</li>
            <li>DD-214 (discharge papers)</li>
            <li>Social Security card</li>
            <li>Any current medications</li>
            <li>Personal clothing and toiletries</li>
            <li>Bedding (sheets, pillow, blanket)</li>
        </ul>
        
        <p><strong>Next Steps:</strong></p>
        <ol>
            <li>Review and sign the attached housing agreement</li>
            <li>Complete the intake packet</li>
            <li>Schedule your orientation meeting</li>
            <li>Set up direct deposit for any benefits</li>
        </ol>
        
        <p>If you have any questions or need assistance before your move-in date, please don't hesitate to call us at <strong>(310) 488-5280</strong>.</p>
        
        <p>We're here to support you every step of the way.</p>
        
        <div class="signature">
            <p>Sincerely,</p>
            <p><strong>Forward Horizon Team</strong><br>
            (310) 488-5280<br>
            info@theforwardhorizon.com</p>
        </div>
    </div>
</body>
</html>
`;

// Housing Agreement Template
const housingAgreement = `
<!DOCTYPE html>
<html>
<head>
    <title>Forward Horizon Housing Agreement</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; font-size: 12px; }
        .header { text-align: center; margin-bottom: 30px; }
        .section { margin: 20px 0; }
        .signature-line { margin-top: 50px; border-bottom: 1px solid black; width: 300px; }
    </style>
</head>
<body>
    <div class="header">
        <h2>FORWARD HORIZON TRANSITIONAL HOUSING AGREEMENT</h2>
        <p>Effective Date: ${currentDate}</p>
    </div>
    
    <div class="section">
        <h3>RESIDENT INFORMATION</h3>
        <p><strong>Name:</strong> ${veteran.name}</p>
        <p><strong>Phone:</strong> ${veteran.phone}</p>
        <p><strong>Email:</strong> ${veteran.email}</p>
        <p><strong>Emergency Contact:</strong> ${veteran.emergencyContact || 'To be provided'}</p>
        <p><strong>Move-in Date:</strong> ${veteran.moveInDate || 'To be scheduled'}</p>
    </div>
    
    <div class="section">
        <h3>PROGRAM TERMS</h3>
        <ol>
            <li><strong>Duration:</strong> This agreement is for transitional housing up to 24 months.</li>
            <li><strong>Rent:</strong> $${veteran.monthlyRent || '0'} per month (if applicable)</li>
            <li><strong>Services Included:</strong> Furnished room, utilities, case management, life skills support</li>
            <li><strong>Program Goals:</strong> Work toward permanent housing and increased independence</li>
        </ol>
    </div>
    
    <div class="section">
        <h3>RESIDENT RESPONSIBILITIES</h3>
        <ol>
            <li>Maintain sobriety and comply with all program rules</li>
            <li>Participate in weekly case management meetings</li>
            <li>Keep assigned living space clean and orderly</li>
            <li>Treat all staff and residents with respect</li>
            <li>Work toward employment and/or benefits enrollment</li>
            <li>Contribute to community chores and activities</li>
        </ol>
    </div>
    
    <div class="section">
        <h3>FORWARD HORIZON RESPONSIBILITIES</h3>
        <ol>
            <li>Provide safe, clean, furnished housing</li>
            <li>Offer case management and support services</li>
            <li>Assist with job placement and benefits enrollment</li>
            <li>Provide 24/7 on-site support</li>
            <li>Connect residents with community resources</li>
        </ol>
    </div>
    
    <div class="section">
        <p>By signing below, both parties agree to the terms outlined in this agreement.</p>
        
        <div style="display: flex; justify-content: space-between; margin-top: 60px;">
            <div>
                <div class="signature-line"></div>
                <p>Resident Signature &nbsp;&nbsp;&nbsp;&nbsp; Date</p>
            </div>
            <div>
                <div class="signature-line"></div>
                <p>Forward Horizon Representative &nbsp;&nbsp;&nbsp;&nbsp; Date</p>
            </div>
        </div>
    </div>
</body>
</html>
`;

// Return both documents
return {
  welcomeLetter: welcomeLetter,
  housingAgreement: housingAgreement,
  veteranName: veteran.name,
  generatedDate: currentDate
};
```

### Step 3: Convert to PDF (Optional)
**HTTP Request Node** - Use HTMLtoPDF service:
- URL: `https://api.html-pdf-node.herokuapp.com/pdf`
- Method: POST
- Body: `{"html": "{{$json.welcomeLetter}}"}`

### Step 4: Send Documents via Email
**Send Email Node:**
- To: `{{ $json.body.email }}`
- Subject: `Welcome to Forward Horizon - Your Housing Documents`
- Attach generated PDFs
- Body with instructions

### Step 5: Save to Google Drive (Optional)
**Google Drive Node:**
- Create folder for veteran
- Upload welcome letter and housing agreement
- Share folder with case manager

## Simple Test Version

For immediate testing, start with just HTML email (no PDF):

### Test Webhook:
```bash
curl -X POST https://your-n8n.cloud/webhook/generate-documents \
  -H "Content-Type: application/json" \
  -d '{
    "body": {
      "name": "John Smith", 
      "phone": "(555) 123-4567",
      "email": "john@example.com",
      "moveInDate": "February 15, 2025",
      "roomNumber": "Room 12A",
      "caseManager": "Sarah Johnson",
      "emergencyContact": "Jane Smith (555) 987-6543"
    }
  }'
```

## Benefits

**Time Saved:** 2-3 hours per veteran (no more manual document creation)
**Consistency:** All documents follow same professional format
**Personalization:** Each document customized with veteran's info
**Immediate:** Generated instantly when veteran is approved

## Next Steps After Basic Version Works

1. Add PDF generation
2. Include facility rules and policies  
3. Add intake forms and checklists
4. Create move-in inspection sheets
5. Generate case management templates

This workflow is much more straightforward than appointments - just templates and data merging!

Want to start building this one?