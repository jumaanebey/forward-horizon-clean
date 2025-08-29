
# Forward Horizon Deployment Instructions

## 🚀 Deploy to Vercel

### Step 1: Prepare for Deployment
```bash
# Commit all changes
git add -A
git commit -m "Add workflow automation APIs"
git push origin main
```

### Step 2: Deploy to Vercel
```bash
# Deploy to production
vercel --prod
```

### Step 3: Set Environment Variables (in Vercel Dashboard)
1. Go to your Vercel project settings
2. Navigate to Environment Variables
3. Add these variables:

```
N8N_WEBHOOK_URL=your_webhook_url (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=admin@theforwardhorizon.com
EMAIL_PASS=your_app_password
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX (optional)
```

## 📍 Production API Endpoints

Once deployed, your APIs will be available at:

- **Document Generation**: 
  `POST https://theforwardhorizon.com/api/generate-documents`
  
- **Donor Automation**: 
  `POST https://theforwardhorizon.com/api/process-donation`
  `GET https://theforwardhorizon.com/api/process-donation` (analytics)
  
- **Appointment System**: 
  `POST https://theforwardhorizon.com/api/appointments/schedule`
  `GET https://theforwardhorizon.com/api/appointments/upcoming`
  `GET https://theforwardhorizon.com/api/appointments/stats`
  
- **System Status**: 
  `GET https://theforwardhorizon.com/api/system-status`

## 🔧 Integration with Your Website

### Example: Generate Documents on Approval
```javascript
// When veteran is approved
async function onVeteranApproved(veteranData) {
  const response = await fetch('https://theforwardhorizon.com/api/generate-documents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(veteranData)
  });
  
  const result = await response.json();
  console.log('Documents generated:', result);
}
```

### Example: Process Donation
```javascript
// When donation is received
async function onDonationReceived(donorData) {
  const response = await fetch('https://theforwardhorizon.com/api/process-donation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(donorData)
  });
  
  const result = await response.json();
  console.log('Thank you package generated:', result);
}
```

## 🎯 Benefits of Vercel Deployment

- **Serverless**: No servers to manage
- **Auto-scaling**: Handles any traffic volume
- **Global CDN**: Fast response times worldwide
- **Free tier**: Generous free usage limits
- **SSL included**: Secure by default
- **Easy rollback**: One-click to previous versions

## 📊 Monitor Your APIs

Check system health:
```bash
curl https://theforwardhorizon.com/api/system-status
```

View donor analytics:
```bash
curl https://theforwardhorizon.com/api/process-donation
```

## 🔒 Security Notes

- All APIs use HTTPS in production
- Add rate limiting if needed
- Consider adding API keys for sensitive endpoints
- Monitor usage in Vercel dashboard

## 💰 Cost

- **Free tier includes**:
  - 100GB bandwidth/month
  - 100,000 function invocations/month
  - Unlimited deployments
  
- **Your expected usage**: Well within free tier!

Ready to deploy your complete automation system!
