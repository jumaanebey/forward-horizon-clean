# Setting up Document Generation Template

## Template: "Generate Professional Document Drafts from PDFs with Google Drive, GPT-4 & Email Notifications"

This template is perfect for Forward Horizon because it can:
- Create professional documents automatically
- Generate welcome letters, housing agreements, intake forms
- Use AI to personalize content
- Send documents via email
- Store in Google Drive for record keeping

## Required Credentials Setup:

### 1. Google Drive ✅ (You likely already have this)
**What it does:** Monitors for new files, stores generated documents
**Setup:**
- Click "Connect" next to Google Drive
- Sign in with your theforwardhorizon@gmail.com account
- Allow N8N access to Google Drive

### 2. OpenAI Chat Model ⚠️ (Need API Key)
**What it does:** Uses GPT-4 to generate personalized document content
**Setup:**
- Go to openai.com/api
- Create account (first $5 of usage is often free)
- Generate API key
- Add to N8N credentials

**Cost:** Very low for document generation (~$0.01-0.03 per document)

### 3. Google Docs ✅ (Same as Google Drive)
**What it does:** Creates and updates Google Docs
**Setup:**
- Use same Google account as Drive
- Should auto-connect when you set up Google Drive

### 4. Gmail ✅ (You have this)
**What it does:** Sends generated documents to veterans/staff
**Setup:**
- Use your existing Gmail credentials
- Same account you've been using for email

## Recommended Setup Order:

### Step 1: Skip OpenAI for Now
- Click **"Skip"** on OpenAI Chat Model
- We'll add this later once basic workflow works
- Start with simple document templates without AI

### Step 2: Connect Google Services
1. **Google Drive** - Connect with theforwardhorizon@gmail.com
2. **Google Docs** - Should auto-connect
3. **Gmail** - Use existing credentials

### Step 3: Test Basic Functionality
- Generate simple documents first
- Add AI enhancement later

### Step 4: Add OpenAI Later (Optional)
- Once basic workflow works
- Get API key from OpenAI
- Add for smarter document generation

## Modified Use Cases for Forward Horizon:

### Instead of PDF Processing, Use for:
1. **Welcome Letter Generation** - When veteran is approved
2. **Housing Agreement Creation** - Personalized lease documents  
3. **Intake Form Generation** - Pre-filled forms for new residents
4. **Case Management Reports** - Monthly progress summaries
5. **Donor Thank You Letters** - Personalized appreciation

### Workflow Flow:
```
Webhook (veteran approval) → 
Generate Document (welcome letter) → 
Save to Google Drive → 
Email to Veteran & Case Manager
```

## Cost Analysis:
- **Google services:** Free (within limits)
- **OpenAI:** ~$0.02 per document (optional)
- **N8N:** Free self-hosted
- **Total cost:** Almost free!

## Benefits:
- **Professional documents** in seconds
- **Consistent branding** and formatting
- **Automatic storage** and organization
- **Email delivery** to all stakeholders
- **Time savings:** 30+ minutes per veteran

Ready to start with the Google services setup? We can skip OpenAI initially and add it later!