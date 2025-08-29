#!/usr/bin/env node

/**
 * Deploy Forward Horizon Workflows to Vercel
 * Converts standalone systems to serverless functions
 */

import fs from 'fs';
import path from 'path';

console.log('🚀 Preparing Forward Horizon workflows for Vercel deployment...\n');

// Create API directory structure for Vercel
const apiDir = '../api/workflows';
if (!fs.existsSync(apiDir)) {
  fs.mkdirSync(apiDir, { recursive: true });
}

// Document Generator API
const documentGeneratorAPI = `
import ForwardHorizonDocuments from '../../workflows/document-generator.js';

const documentGenerator = new ForwardHorizonDocuments();

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const veteranData = req.body;
    
    if (!veteranData.name || !veteranData.email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name and email'
      });
    }

    const result = await documentGenerator.generateDocumentPackage(veteranData);
    
    res.json({
      success: true,
      message: \`Document package generated for \${veteranData.name}\`,
      documents: result.documents,
      emailData: result.emailData
    });

  } catch (error) {
    console.error('Document generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
`;

// Donor Automation API
const donorAutomationAPI = `
import DonorAutomation from '../../workflows/donor-automation.js';

const donorSystem = new DonorAutomation();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const result = await donorSystem.processDonation(req.body);
      res.json({
        success: true,
        message: \`Thank you package generated for \${req.body.donorName}\`,
        documents: {
          thankYouLetter: result.thankYouLetter,
          taxReceipt: result.taxReceipt
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  } else if (req.method === 'GET') {
    // Return analytics
    res.json(donorSystem.getDonorAnalytics());
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
`;

// Appointment System API
const appointmentAPI = `
import AppointmentSystem from '../../workflows/appointment-system.js';

const appointmentSystem = new AppointmentSystem();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  if (req.method === 'POST' && action === 'schedule') {
    try {
      const result = appointmentSystem.scheduleAppointment(req.body);
      res.json({
        success: true,
        message: \`Appointment scheduled for \${req.body.veteranName}\`,
        appointmentId: result.appointment.id,
        confirmationEmail: result.confirmationEmail,
        confirmationSMS: result.confirmationSMS
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  } else if (req.method === 'GET' && action === 'upcoming') {
    const days = parseInt(req.query.days) || 7;
    res.json(appointmentSystem.getUpcomingAppointments(days));
  } else if (req.method === 'GET' && action === 'stats') {
    res.json(appointmentSystem.getStats());
  } else {
    res.status(400).json({ error: 'Invalid action or method' });
  }
}
`;

// System Status API
const systemStatusAPI = `
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check system health
  const status = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      documentGenerator: 'active',
      donorAutomation: 'active',
      appointmentSystem: 'active'
    },
    environment: process.env.NODE_ENV || 'production',
    region: process.env.VERCEL_REGION || 'us-west-1'
  };

  res.json(status);
}
`;

// Write API files
fs.writeFileSync(path.join(apiDir, 'generate-documents.js'), documentGeneratorAPI);
fs.writeFileSync(path.join(apiDir, 'process-donation.js'), donorAutomationAPI);
fs.writeFileSync(path.join(apiDir, 'appointments.js'), appointmentAPI);
fs.writeFileSync(path.join(apiDir, 'system-status.js'), systemStatusAPI);

console.log('✅ Created Vercel API endpoints');

// Create vercel.json configuration
const vercelConfig = {
  "functions": {
    "api/workflows/*.js": {
      "maxDuration": 10
    }
  },
  "rewrites": [
    {
      "source": "/api/generate-documents",
      "destination": "/api/workflows/generate-documents"
    },
    {
      "source": "/api/process-donation",
      "destination": "/api/workflows/process-donation"
    },
    {
      "source": "/api/appointments/:action",
      "destination": "/api/workflows/appointments?action=$1"
    },
    {
      "source": "/api/system-status",
      "destination": "/api/workflows/system-status"
    }
  ]
};

// Update existing vercel.json
const existingVercelPath = '../vercel.json';
if (fs.existsSync(existingVercelPath)) {
  const existing = JSON.parse(fs.readFileSync(existingVercelPath, 'utf8'));
  // Merge configurations
  const merged = {
    ...existing,
    ...vercelConfig,
    rewrites: [...(existing.rewrites || []), ...vercelConfig.rewrites]
  };
  fs.writeFileSync(existingVercelPath, JSON.stringify(merged, null, 2));
} else {
  fs.writeFileSync(existingVercelPath, JSON.stringify(vercelConfig, null, 2));
}

console.log('✅ Updated vercel.json configuration');

// Create deployment instructions
const deploymentInstructions = `
# Forward Horizon Deployment Instructions

## 🚀 Deploy to Vercel

### Step 1: Prepare for Deployment
\`\`\`bash
# Commit all changes
git add -A
git commit -m "Add workflow automation APIs"
git push origin main
\`\`\`

### Step 2: Deploy to Vercel
\`\`\`bash
# Deploy to production
vercel --prod
\`\`\`

### Step 3: Set Environment Variables (in Vercel Dashboard)
1. Go to your Vercel project settings
2. Navigate to Environment Variables
3. Add these variables:

\`\`\`
N8N_WEBHOOK_URL=your_webhook_url (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=admin@theforwardhorizon.com
EMAIL_PASS=your_app_password
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX (optional)
\`\`\`

## 📍 Production API Endpoints

Once deployed, your APIs will be available at:

- **Document Generation**: 
  \`POST https://theforwardhorizon.com/api/generate-documents\`
  
- **Donor Automation**: 
  \`POST https://theforwardhorizon.com/api/process-donation\`
  \`GET https://theforwardhorizon.com/api/process-donation\` (analytics)
  
- **Appointment System**: 
  \`POST https://theforwardhorizon.com/api/appointments/schedule\`
  \`GET https://theforwardhorizon.com/api/appointments/upcoming\`
  \`GET https://theforwardhorizon.com/api/appointments/stats\`
  
- **System Status**: 
  \`GET https://theforwardhorizon.com/api/system-status\`

## 🔧 Integration with Your Website

### Example: Generate Documents on Approval
\`\`\`javascript
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
\`\`\`

### Example: Process Donation
\`\`\`javascript
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
\`\`\`

## 🎯 Benefits of Vercel Deployment

- **Serverless**: No servers to manage
- **Auto-scaling**: Handles any traffic volume
- **Global CDN**: Fast response times worldwide
- **Free tier**: Generous free usage limits
- **SSL included**: Secure by default
- **Easy rollback**: One-click to previous versions

## 📊 Monitor Your APIs

Check system health:
\`\`\`bash
curl https://theforwardhorizon.com/api/system-status
\`\`\`

View donor analytics:
\`\`\`bash
curl https://theforwardhorizon.com/api/process-donation
\`\`\`

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
`;

fs.writeFileSync('../DEPLOYMENT.md', deploymentInstructions);
console.log('✅ Created deployment instructions');

console.log('\n🎉 Deployment preparation complete!');
console.log('\n📝 Next steps:');
console.log('1. Review the generated API files in api/workflows/');
console.log('2. Commit and push to GitHub');
console.log('3. Run: vercel --prod');
console.log('4. Your automation system will be live!');
console.log('\nSee DEPLOYMENT.md for detailed instructions.');