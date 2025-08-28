# 🚀 N8N Setup for Forward Horizon

## Quick Start (10 minutes)

### Step 1: Sign Up for N8N Cloud
1. Go to [n8n.io](https://n8n.io)
2. Click "Start for free" ($20/month after trial)
3. Create your account

### Step 2: Import the Workflow
1. In N8N, click "Add workflow" → "Import from File"
2. Upload `n8n-workflows/application-processor.json`
3. You'll see a visual workflow appear

### Step 3: Configure Services

#### Gmail Setup:
1. Click the "Send Confirmation Email" node
2. Add credentials → Gmail
3. Use your `theforwardhorizon@gmail.com` account
4. Generate app password: https://myaccount.google.com/apppasswords

#### Google Sheets Setup:
1. Create a new Google Sheet for applications
2. Add headers: Name, Email, Phone, Program, Urgency, Date, Status
3. Click "Log to Google Sheets" node
4. Connect your Google account
5. Select your sheet

#### Twilio Setup (Optional - for SMS):
1. Sign up at [twilio.com](https://twilio.com) (free trial)
2. Get your Account SID and Auth Token
3. Buy a phone number ($1/month)
4. Add credentials to N8N

#### Slack Setup (Optional):
1. Create Slack workspace if needed
2. Add Slack app to N8N
3. Select channel for notifications

### Step 4: Get Your Webhook URL
1. Click the "Webhook" node
2. Copy the Production URL (looks like: `https://your-instance.n8n.cloud/webhook/abc123`)
3. This is your N8N_WEBHOOK_URL

### Step 5: Update Vercel Environment
```bash
vercel env add N8N_WEBHOOK_URL production
# Paste your webhook URL when prompted
```

### Step 6: Update Your API
Replace `/api/submit-form.js` with the simplified `/api/submit-to-n8n.js`

### Step 7: Deploy
```bash
vercel --prod
```

## 🎯 What N8N Replaces

### Before (Your Code):
- ❌ 238 lines of email code
- ❌ Nodemailer configuration
- ❌ HTML email templates in code
- ❌ Error handling for email failures
- ❌ Manual logging
- ❌ No SMS notifications
- ❌ No Slack integration
- ❌ No automatic Google Sheets

### After (With N8N):
- ✅ 40 lines total
- ✅ Visual workflow editor
- ✅ Automatic retries
- ✅ Built-in error handling
- ✅ SMS alerts
- ✅ Slack notifications
- ✅ Google Sheets logging
- ✅ Easy to modify without coding

## 📊 Workflow Features

### Application Processor Workflow:
```
Form Submission → N8N Webhook
                ├→ Send confirmation email to applicant
                ├→ Log to Google Sheets
                ├→ SMS alert to staff (if urgent)
                ├→ Post to Slack channel
                └→ Return success to website
```

### Advanced Features You Get:
1. **Conditional Logic**: Different actions based on urgency
2. **Data Enrichment**: Add timestamps, calculate wait times
3. **Error Handling**: Automatic retries, fallback actions
4. **Scheduling**: Follow-up reminders, daily reports
5. **Integrations**: 400+ services available

## 🔧 Additional Workflows to Create

### 1. Daily Report Workflow
- Runs every morning at 9 AM
- Counts applications from yesterday
- Sends summary to admin email
- Updates dashboard

### 2. Follow-Up Automation
- Triggers 48 hours after application
- Checks if applicant was contacted
- Sends reminder to staff
- Logs follow-up status

### 3. Volunteer Onboarding
- Welcome email sequence
- Calendar invite for orientation
- Document checklist
- Background check initiation

### 4. Donation Processing
- Thank you email with tax receipt
- Add to donor database
- Update fundraising thermometer
- Send impact report

## 💰 Cost Comparison

### Current Setup:
- Email service: $0-20/month
- Manual labor: 10+ hours/week ($250+ value)
- Missed opportunities: Priceless

### With N8N:
- N8N Cloud: $20/month
- Setup time: 2 hours once
- Ongoing maintenance: 30 min/week
- **ROI: 10x in first month**

## 🚨 Troubleshooting

### Form not submitting?
1. Check N8N webhook is active (green dot)
2. Verify webhook URL in environment variables
3. Check N8N execution logs

### Emails not sending?
1. Verify Gmail credentials in N8N
2. Check spam folder
3. Ensure app password is correct

### Need help?
- N8N Community: https://community.n8n.io
- Documentation: https://docs.n8n.io
- Video tutorials: https://www.youtube.com/n8n

## 🎉 Success Metrics

After implementing N8N, you should see:
- ⚡ Instant response to all applications
- 📈 100% form tracking (nothing lost)
- ⏰ 10+ hours/week saved
- 😊 Happier staff (less admin work)
- 🏠 Faster placement for residents

---

**Ready to automate?** Start with the application workflow, then expand to other areas. N8N transforms Forward Horizon from reactive to proactive!