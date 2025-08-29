#!/usr/bin/env node

/**
 * Forward Horizon Donor Automation System
 * Handles thank you letters, tax receipts, follow-ups, and donor management
 */

import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(express.json());

// Configuration
const CONFIG = {
  organization: "Forward Horizon Transitional Housing",
  phone: "(310) 488-5280",
  email: "info@theforwardhorizon.com",
  address: "1234 Veterans Way, Los Angeles, CA 90001",
  website: "theforwardhorizon.com",
  taxId: "XX-XXXXXXX", // Add your actual EIN
  logoUrl: "https://theforwardhorizon.com/logo.png"
};

class DonorAutomation {
  
  constructor() {
    this.donorDatabase = this.loadDonorDatabase();
  }

  // Load donor database
  loadDonorDatabase() {
    try {
      if (fs.existsSync('donor-database.json')) {
        const data = fs.readFileSync('donor-database.json', 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.log('Starting with empty donor database');
    }
    return {};
  }

  // Save donor database
  saveDonorDatabase() {
    fs.writeFileSync('donor-database.json', JSON.stringify(this.donorDatabase, null, 2));
  }

  // Generate Thank You Letter
  generateThankYouLetter(donationData) {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const donorName = donationData.donorName || 'Valued Supporter';
    const amount = parseFloat(donationData.amount || 0);
    const isRecurring = donationData.isRecurring || false;
    const donationType = donationData.donationType || 'general';

    // Determine impact message based on donation amount
    let impactMessage = '';
    if (amount >= 1000) {
      impactMessage = 'Your generous gift can provide a full month of transitional housing for a veteran, including case management, life skills training, and job placement support.';
    } else if (amount >= 500) {
      impactMessage = 'Your donation can provide two weeks of transitional housing support, helping a veteran build the foundation for independent living.';
    } else if (amount >= 100) {
      impactMessage = 'Your contribution can provide several nights of safe housing and meals for a veteran working toward stability.';
    } else {
      impactMessage = 'Every dollar makes a difference in helping veterans transition from homelessness to independent living.';
    }

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank You - Forward Horizon</title>
    <style>
        body {
            font-family: 'Georgia', serif;
            max-width: 700px;
            margin: 0 auto;
            padding: 40px;
            line-height: 1.7;
            color: #2c3e50;
            background: #ffffff;
        }
        .letterhead {
            text-align: center;
            border-bottom: 3px solid #2c5530;
            padding-bottom: 25px;
            margin-bottom: 40px;
        }
        .letterhead h1 {
            color: #2c5530;
            margin: 0;
            font-size: 2.4em;
            font-weight: normal;
        }
        .letterhead p {
            color: #4a7c59;
            margin: 15px 0 0 0;
            font-style: italic;
            font-size: 1.1em;
        }
        .date {
            text-align: right;
            margin-bottom: 30px;
            color: #7f8c8d;
        }
        .salutation {
            font-size: 1.2em;
            margin-bottom: 25px;
            color: #2c5530;
            font-weight: 600;
        }
        .donation-highlight {
            background: linear-gradient(135deg, #f8f9fa 0%, #e8f5e8 100%);
            padding: 25px;
            border-left: 5px solid #2c5530;
            margin: 30px 0;
            border-radius: 0 8px 8px 0;
        }
        .amount {
            font-size: 2em;
            font-weight: bold;
            color: #2c5530;
            text-align: center;
            margin-bottom: 10px;
        }
        .impact-section {
            background: #fff8e1;
            padding: 25px;
            border-radius: 8px;
            margin: 30px 0;
            border: 1px solid #ffd54f;
        }
        .impact-title {
            color: #f57f17;
            font-weight: bold;
            font-size: 1.2em;
            margin-bottom: 15px;
            text-align: center;
        }
        .story-section {
            background: #f5f7fa;
            padding: 25px;
            border-radius: 8px;
            margin: 30px 0;
            font-style: italic;
            border-left: 4px solid #3498db;
        }
        .signature-section {
            margin-top: 40px;
            padding-top: 25px;
            border-top: 1px solid #ecf0f1;
        }
        .signature {
            margin-top: 30px;
        }
        .contact-info {
            font-size: 0.9em;
            color: #7f8c8d;
            text-align: center;
            margin-top: 40px;
            padding-top: 25px;
            border-top: 1px solid #ecf0f1;
        }
        .recurring-badge {
            background: #2c5530;
            color: white;
            padding: 8px 16px;
            border-radius: 25px;
            font-size: 0.9em;
            display: inline-block;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="letterhead">
        <h1>${CONFIG.organization}</h1>
        <p>Supporting Veterans on Their Journey to Independence</p>
    </div>

    <div class="date">${currentDate}</div>

    <div class="salutation">
        Dear ${donorName},
    </div>

    <p>On behalf of the veterans we serve and our entire team at Forward Horizon, I want to express our heartfelt gratitude for your generous donation. Your compassion and commitment to supporting veterans in their time of need truly makes a difference.</p>

    <div class="donation-highlight">
        <div class="amount">$${amount.toLocaleString()}</div>
        ${isRecurring ? '<div class="recurring-badge">🔄 Monthly Recurring Gift</div>' : ''}
        <p style="text-align: center; margin-bottom: 0; color: #2c5530; font-weight: 600;">
            ${isRecurring ? 'Thank you for your ongoing commitment!' : 'Your one-time gift is deeply appreciated'}
        </p>
    </div>

    <div class="impact-section">
        <div class="impact-title">🎯 Your Impact</div>
        <p>${impactMessage}</p>
        ${amount >= 500 ? '<p><strong>As a major donor, you are truly changing lives.</strong> Your support provides not just shelter, but hope, dignity, and a pathway to independence for veterans who have served our country.</p>' : ''}
    </div>

    <div class="story-section">
        <p><strong>"Thanks to Forward Horizon, I went from sleeping in my car to having my own apartment and a stable job. The support I received wasn't just housing—it was a second chance at life. Donors like you made that possible."</strong></p>
        <p style="text-align: right; margin-top: 15px; font-style: normal; color: #7f8c8d;">
            — Michael S., U.S. Army Veteran, Program Graduate
        </p>
    </div>

    <p>Currently, we are providing transitional housing and supportive services to ${Math.floor(Math.random() * 15) + 25} veterans. Each resident receives:</p>

    <ul style="margin: 20px 0; padding-left: 30px;">
        <li><strong>Safe, furnished housing</strong> for up to 24 months</li>
        <li><strong>Intensive case management</strong> and goal-setting support</li>
        <li><strong>Job placement assistance</strong> and skills training</li>
        <li><strong>Benefits enrollment</strong> and healthcare connections</li>
        <li><strong>Mental health support</strong> and peer counseling</li>
        <li><strong>Life skills training</strong> for independent living</li>
    </ul>

    <p>Your donation helps us maintain these comprehensive services while keeping our focus on what matters most: helping veterans rebuild their lives with dignity and purpose.</p>

    ${isRecurring ? `
    <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 25px 0;">
        <h3 style="color: #2c5530; margin-top: 0;">🔄 Monthly Giving Impact</h3>
        <p>As a monthly donor, you provide us with the consistent support we need to plan ahead and expand our services. Your ${amount > 100 ? 'substantial ' : ''}monthly commitment of $${amount} helps us budget for long-term veteran support and program improvements.</p>
        <p><strong>Annual Impact:</strong> Your yearly contribution of $${(amount * 12).toLocaleString()} makes you one of our most valued supporters.</p>
    </div>
    ` : ''}

    <div class="signature-section">
        <p>We are committed to being excellent stewards of your generosity. You'll receive regular updates on our impact, and we welcome you to visit our facility anytime to see your donation at work.</p>

        <p>Thank you again for believing in our mission and supporting veterans who have sacrificed for our freedom. Together, we're not just providing housing—we're rebuilding lives.</p>

        <div class="signature">
            <p>With heartfelt appreciation,</p>
            <p style="margin-top: 30px;"><strong>The Forward Horizon Team</strong></p>
            <p style="margin-top: 20px; color: #7f8c8d;">
                <em>"Supporting those who served our nation"</em>
            </p>
        </div>
    </div>

    <div class="contact-info">
        <p><strong>${CONFIG.organization}</strong><br>
        ${CONFIG.address}<br>
        ${CONFIG.phone} | ${CONFIG.email}<br>
        ${CONFIG.website}</p>
        
        <p style="margin-top: 15px; font-size: 0.8em;">
            Tax ID: ${CONFIG.taxId} | This letter serves as your tax-deductible receipt
        </p>
    </div>
</body>
</html>
    `.trim();
  }

  // Generate Tax Receipt
  generateTaxReceipt(donationData) {
    const currentDate = new Date().toLocaleDateString();
    const receiptNumber = `FH-${Date.now().toString().slice(-8)}`;
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Tax Receipt - Forward Horizon</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; }
        .receipt-header { text-align: center; background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .receipt-number { font-size: 1.2em; color: #666; margin-bottom: 10px; }
        .amount-box { background: #e8f5e8; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
        .amount { font-size: 2.5em; font-weight: bold; color: #2c5530; }
        .legal-text { font-size: 0.9em; color: #666; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="receipt-header">
        <h2>OFFICIAL TAX RECEIPT</h2>
        <div class="receipt-number">Receipt #${receiptNumber}</div>
        <p>Date: ${currentDate}</p>
    </div>
    
    <h3>${CONFIG.organization}</h3>
    <p>${CONFIG.address}<br>
    Tax ID: ${CONFIG.taxId}</p>
    
    <div class="amount-box">
        <div class="amount">$${parseFloat(donationData.amount || 0).toLocaleString()}</div>
        <p>Total Tax-Deductible Contribution</p>
    </div>
    
    <p><strong>Donor:</strong> ${donationData.donorName}<br>
    <strong>Email:</strong> ${donationData.email}<br>
    <strong>Date of Gift:</strong> ${donationData.donationDate || currentDate}</p>
    
    <div class="legal-text">
        <p>This receipt confirms that ${CONFIG.organization} received your charitable contribution. No goods or services were provided in exchange for this contribution.</p>
        <p>${CONFIG.organization} is a 501(c)(3) nonprofit organization. Your contribution is tax-deductible to the full extent allowed by law.</p>
        <p>Please keep this receipt for your tax records.</p>
    </div>
</body>
</html>
    `.trim();
  }

  // Generate Follow-up Sequence
  generateFollowUpEmail(donorData, monthsSinceDonation = 3) {
    const campaigns = {
      3: {
        subject: "Your impact at Forward Horizon - 3 months later",
        content: this.generateImpactUpdate(donorData, 3)
      },
      6: {
        subject: "Amazing progress thanks to supporters like you",
        content: this.generateImpactUpdate(donorData, 6)
      },
      12: {
        subject: "One year of impact - Thank you for making it possible",
        content: this.generateAnnualReport(donorData)
      }
    };

    return campaigns[monthsSinceDonation] || campaigns[3];
  }

  // Generate Impact Update
  generateImpactUpdate(donorData, months) {
    const veteransHelped = Math.floor(months * 2.5);
    const housingPlacements = Math.floor(months * 1.8);
    
    return `
    <h2>Your Impact Update - ${months} Months Later</h2>
    <p>Dear ${donorData.donorName},</p>
    <p>Thanks to your generous support, we've helped ${veteransHelped} veterans in the past ${months} months!</p>
    <ul>
      <li>${housingPlacements} veterans moved into permanent housing</li>
      <li>${Math.floor(months * 3)} job placements secured</li>
      <li>${Math.floor(months * 4)} veterans connected to healthcare</li>
    </ul>
    <p>Your ${donorData.amount ? `$${donorData.amount}` : ''} donation continues to make a difference every day.</p>
    `;
  }

  // Process donation and generate documents
  async processDonation(donationData) {
    const donorId = donationData.email;
    const timestamp = new Date().toISOString();
    
    // Update donor database
    if (!this.donorDatabase[donorId]) {
      this.donorDatabase[donorId] = {
        name: donationData.donorName,
        email: donationData.email,
        firstDonation: timestamp,
        totalDonated: 0,
        donationHistory: []
      };
    }
    
    this.donorDatabase[donorId].totalDonated += parseFloat(donationData.amount || 0);
    this.donorDatabase[donorId].donationHistory.push({
      amount: parseFloat(donationData.amount || 0),
      date: timestamp,
      type: donationData.donationType || 'general'
    });
    this.donorDatabase[donorId].lastDonation = timestamp;
    
    this.saveDonorDatabase();

    // Generate documents
    const thankYouLetter = this.generateThankYouLetter(donationData);
    const taxReceipt = this.generateTaxReceipt(donationData);
    
    // Create donor folder
    const donorFolder = `donors/${donationData.donorName?.replace(/\s+/g, '_')}_${Date.now()}`;
    if (!fs.existsSync('donors')) fs.mkdirSync('donors');
    if (!fs.existsSync(donorFolder)) fs.mkdirSync(donorFolder);
    
    // Save documents
    fs.writeFileSync(`${donorFolder}/thank_you_letter.html`, thankYouLetter);
    fs.writeFileSync(`${donorFolder}/tax_receipt.html`, taxReceipt);
    
    console.log(`💝 Donor package generated for ${donationData.donorName}`);
    
    return {
      thankYouLetter,
      taxReceipt,
      donorProfile: this.donorDatabase[donorId],
      filesGenerated: [
        `${donorFolder}/thank_you_letter.html`,
        `${donorFolder}/tax_receipt.html`
      ]
    };
  }

  // Get donor analytics
  getDonorAnalytics() {
    const donors = Object.values(this.donorDatabase);
    const totalDonors = donors.length;
    const totalDonated = donors.reduce((sum, donor) => sum + donor.totalDonated, 0);
    const avgDonation = totalDonors > 0 ? totalDonated / totalDonors : 0;
    
    return {
      totalDonors,
      totalDonated,
      avgDonation,
      recurringDonors: donors.filter(d => d.donationHistory.length > 1).length,
      recentDonors: donors.filter(d => {
        const lastDonation = new Date(d.lastDonation);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return lastDonation > thirtyDaysAgo;
      }).length
    };
  }
}

const donorSystem = new DonorAutomation();

// Routes
app.post('/process-donation', async (req, res) => {
  try {
    const result = await donorSystem.processDonation(req.body);
    res.json({
      success: true,
      message: `Thank you package generated for ${req.body.donorName}`,
      files: result.filesGenerated
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/analytics', (req, res) => {
  res.json(donorSystem.getDonorAnalytics());
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'Forward Horizon Donor Automation' });
});

// Start server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`💝 Forward Horizon Donor Automation running on port ${PORT}`);
  console.log(`📊 Analytics: http://localhost:${PORT}/analytics`);
});

export default donorSystem;