#!/usr/bin/env node

/**
 * Forward Horizon Document Generator
 * Standalone version that can be imported to N8N or run independently
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

// Configuration
const CONFIG = {
  organization: "Forward Horizon Transitional Housing",
  phone: "(310) 488-5280",
  email: "info@theforwardhorizon.com",
  address: "1234 Veterans Way, Los Angeles, CA 90001",
  website: "theforwardhorizon.com"
};

class ForwardHorizonDocuments {
  
  // Generate Welcome Letter
  generateWelcomeLetter(veteranData) {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Forward Horizon</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            line-height: 1.6;
            color: #333;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #2c5530;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #2c5530;
            margin: 0;
            font-size: 2.2em;
        }
        .header p {
            color: #4a7c59;
            margin: 10px 0 0 0;
            font-style: italic;
        }
        .welcome-content {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .details-box {
            background: #e8f5e8;
            padding: 20px;
            border-left: 4px solid #2c5530;
            margin: 20px 0;
        }
        .checklist {
            background: #fff3cd;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .signature {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
        }
        ul, ol {
            padding-left: 25px;
        }
        li {
            margin-bottom: 8px;
        }
        .highlight {
            background: #fff3cd;
            padding: 2px 6px;
            border-radius: 3px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${CONFIG.organization}</h1>
        <p>Supporting Veterans on Their Journey to Independence</p>
    </div>

    <div class="welcome-content">
        <p><strong>Date:</strong> ${currentDate}</p>
        
        <h2>Dear ${veteranData.name || 'Valued Veteran'},</h2>
        
        <p>Welcome to Forward Horizon! We are deeply honored to support you on your journey toward stable, independent living. Your service to our country deserves recognition, and we're here to help you build the foundation for your next chapter.</p>
    </div>

    <div class="details-box">
        <h3>🏠 Your Housing Details</h3>
        <ul>
            <li><strong>Move-in Date:</strong> ${veteranData.moveInDate || 'To be scheduled within 7 days'}</li>
            <li><strong>Room Assignment:</strong> ${veteranData.roomNumber || 'Will be assigned upon arrival'}</li>
            <li><strong>Program Duration:</strong> Up to 24 months transitional support</li>
            <li><strong>Case Manager:</strong> ${veteranData.caseManager || 'Will be assigned on move-in day'}</li>
            <li><strong>Monthly Program Fee:</strong> $${veteranData.monthlyRent || '0 (covered by grants)'}</li>
        </ul>
    </div>

    <div class="checklist">
        <h3>📋 What to Bring on Move-In Day</h3>
        <h4>Required Documents:</h4>
        <ul>
            <li>Valid photo identification (driver's license or state ID)</li>
            <li>DD-214 or military discharge papers</li>
            <li>Social Security card</li>
            <li>Birth certificate (if available)</li>
            <li>Any current benefit award letters (VA, SSI, SSDI)</li>
        </ul>
        
        <h4>Personal Items:</h4>
        <ul>
            <li>Personal clothing for one week</li>
            <li>Essential toiletries and medications</li>
            <li>Bedding (sheets, pillow, blanket)</li>
            <li>Personal electronics (phone, laptop if owned)</li>
            <li>Important personal documents in a folder</li>
        </ul>
        
        <h4>What We Provide:</h4>
        <ul>
            <li>Fully furnished private or shared room</li>
            <li>All utilities (electric, water, internet, cable)</li>
            <li>Kitchen access with basic cookware</li>
            <li>Laundry facilities</li>
            <li>24/7 on-site support staff</li>
        </ul>
    </div>

    <div class="details-box">
        <h3>🎯 Your First Week Schedule</h3>
        <ol>
            <li><strong>Day 1:</strong> Move-in, room assignment, facility orientation</li>
            <li><strong>Day 2-3:</strong> Complete intake paperwork and assessments</li>
            <li><strong>Day 4:</strong> Meet with your assigned case manager</li>
            <li><strong>Day 5:</strong> Benefits enrollment assistance (VA, healthcare, etc.)</li>
            <li><strong>Week 1:</strong> Individual goal-setting session</li>
        </ol>
    </div>

    <div class="welcome-content">
        <h3>📞 Important Contacts</h3>
        <ul>
            <li><strong>Main Office:</strong> <span class="highlight">${CONFIG.phone}</span></li>
            <li><strong>24/7 Support Line:</strong> ${CONFIG.phone} (Press 1 for emergencies)</li>
            <li><strong>Email:</strong> ${CONFIG.email}</li>
            <li><strong>Address:</strong> ${CONFIG.address}</li>
        </ul>
        
        <h3>🆘 Emergency Situations</h3>
        <p>If you experience any crisis or emergency before your move-in date:</p>
        <ul>
            <li><strong>Call us immediately:</strong> ${CONFIG.phone}</li>
            <li><strong>National Crisis Line:</strong> 988 (24/7 support)</li>
            <li><strong>Veterans Crisis Line:</strong> 1-800-273-8255</li>
        </ul>
    </div>

    <div class="signature">
        <p>We're committed to walking alongside you as you rebuild and move toward independent living. Every veteran deserves stability, dignity, and hope for the future.</p>
        
        <p>If you have any questions or concerns before your move-in date, please don't hesitate to reach out. We're here for you.</p>
        
        <p><strong>Welcome home,</strong></p>
        
        <p><strong>The Forward Horizon Team</strong><br>
        ${CONFIG.phone}<br>
        ${CONFIG.email}<br>
        <em>Serving those who served our nation</em></p>
    </div>
</body>
</html>
    `.trim();
  }

  // Generate Housing Agreement
  generateHousingAgreement(veteranData) {
    const currentDate = new Date().toLocaleDateString();
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 2);
    const maxStayDate = futureDate.toLocaleDateString();

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Forward Horizon Housing Agreement</title>
    <style>
        body {
            font-family: 'Times New Roman', serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            line-height: 1.5;
            font-size: 12px;
            color: #000;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #000;
            padding-bottom: 15px;
        }
        .section {
            margin: 25px 0;
        }
        .section h3 {
            background: #f0f0f0;
            padding: 8px;
            margin: 20px 0 10px 0;
            text-transform: uppercase;
            font-size: 13px;
        }
        .signature-block {
            margin-top: 60px;
            display: flex;
            justify-content: space-between;
        }
        .signature-line {
            border-bottom: 1px solid #000;
            width: 250px;
            margin-bottom: 5px;
        }
        ol, ul {
            padding-left: 25px;
        }
        li {
            margin-bottom: 10px;
        }
        .important {
            background: #fffacd;
            padding: 15px;
            border: 1px solid #ddd;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>FORWARD HORIZON TRANSITIONAL HOUSING AGREEMENT</h2>
        <p><strong>Effective Date:</strong> ${currentDate}</p>
        <p><strong>Maximum Program Duration:</strong> 24 months (ending ${maxStayDate})</p>
    </div>

    <div class="section">
        <h3>Resident Information</h3>
        <p><strong>Full Name:</strong> ${veteranData.name || '_________________________'}</p>
        <p><strong>Phone Number:</strong> ${veteranData.phone || '_________________________'}</p>
        <p><strong>Email Address:</strong> ${veteranData.email || '_________________________'}</p>
        <p><strong>Emergency Contact:</strong> ${veteranData.emergencyContact || '_________________________'}</p>
        <p><strong>Move-in Date:</strong> ${veteranData.moveInDate || '_________________________'}</p>
        <p><strong>Room Assignment:</strong> ${veteranData.roomNumber || 'TBD'}</p>
        <p><strong>Case Manager:</strong> ${veteranData.caseManager || 'TBD'}</p>
    </div>

    <div class="section">
        <h3>Program Terms and Conditions</h3>
        <ol>
            <li><strong>Housing Type:</strong> Transitional housing with supportive services designed to help veterans achieve independent living.</li>
            <li><strong>Program Duration:</strong> Maximum stay of 24 months, with progress reviews every 90 days.</li>
            <li><strong>Monthly Program Fee:</strong> $${veteranData.monthlyRent || '0.00'} per month, due by the 1st of each month.</li>
            <li><strong>Utilities and Services Included:</strong> Electricity, water, heat, internet, basic cable, and furnished accommodations.</li>
            <li><strong>Goal:</strong> Transition to permanent independent housing within the program timeframe.</li>
        </ol>
    </div>

    <div class="section">
        <h3>Resident Responsibilities</h3>
        <ol>
            <li><strong>Sobriety Requirement:</strong> Maintain complete sobriety from illegal drugs and alcohol while in the program.</li>
            <li><strong>Case Management:</strong> Attend weekly case management meetings and work toward established goals.</li>
            <li><strong>Housing Maintenance:</strong> Keep assigned living space clean, safe, and in good condition.</li>
            <li><strong>Community Standards:</strong> Treat all residents, staff, and visitors with respect and courtesy.</li>
            <li><strong>Employment/Benefits:</strong> Actively pursue employment, education, or benefits enrollment as appropriate.</li>
            <li><strong>Community Participation:</strong> Participate in house meetings, chores, and community activities.</li>
            <li><strong>Guests and Visitors:</strong> Follow all guest policies; no overnight visitors without prior approval.</li>
            <li><strong>Curfew:</strong> Respect house curfew of 11:00 PM Sunday-Thursday, 12:00 AM Friday-Saturday.</li>
            <li><strong>Smoking Policy:</strong> Smoking permitted only in designated outdoor areas.</li>
            <li><strong>Personal Property:</strong> Forward Horizon is not responsible for lost or stolen personal items.</li>
        </ol>
    </div>

    <div class="section">
        <h3>Forward Horizon Responsibilities</h3>
        <ol>
            <li><strong>Safe Housing:</strong> Provide safe, clean, and secure transitional housing accommodations.</li>
            <li><strong>Support Services:</strong> Offer case management, life skills training, and goal-setting support.</li>
            <li><strong>Resource Connection:</strong> Assist with connections to employment, benefits, healthcare, and other community resources.</li>
            <li><strong>24/7 Support:</strong> Provide on-site support staff and emergency contact availability.</li>
            <li><strong>Fair Treatment:</strong> Ensure all residents are treated with dignity and respect regardless of race, religion, gender, or sexual orientation.</li>
            <li><strong>Privacy:</strong> Respect resident privacy within the bounds of program safety and structure.</li>
        </ol>
    </div>

    <div class="important">
        <h3>Program Violations and Consequences</h3>
        <p>Violations of this agreement may result in:</p>
        <ul>
            <li>Verbal or written warnings</li>
            <li>Loss of privileges</li>
            <li>Mandatory additional programming</li>
            <li>Termination from the program</li>
        </ul>
        <p><strong>Immediate termination offenses include:</strong> Violence, illegal drug use, alcohol consumption, theft, or possession of weapons.</p>
    </div>

    <div class="section">
        <h3>Termination and Move-Out</h3>
        <ol>
            <li><strong>Successful Completion:</strong> Resident achieves independent housing and program goals.</li>
            <li><strong>Voluntary Departure:</strong> Resident provides 30-day written notice.</li>
            <li><strong>Program Violation:</strong> Termination due to violation of agreement terms.</li>
            <li><strong>Maximum Stay:</strong> Program completion at 24-month maximum.</li>
        </ol>
    </div>

    <div class="section">
        <h3>Agreement Acknowledgment</h3>
        <p>By signing below, both parties acknowledge they have read, understood, and agree to abide by all terms and conditions outlined in this agreement.</p>
        
        <p>This agreement may be modified only by written mutual consent of both parties.</p>
    </div>

    <div class="signature-block">
        <div style="text-align: center;">
            <div class="signature-line"></div>
            <p><strong>Resident Signature</strong></p>
            <div class="signature-line"></div>
            <p><strong>Date</strong></p>
        </div>
        <div style="text-align: center;">
            <div class="signature-line"></div>
            <p><strong>Forward Horizon Representative</strong></p>
            <div class="signature-line"></div>
            <p><strong>Date</strong></p>
        </div>
    </div>

    <div style="margin-top: 40px; text-align: center; font-size: 10px; color: #666;">
        <p>Forward Horizon Transitional Housing<br>
        ${CONFIG.address}<br>
        ${CONFIG.phone} | ${CONFIG.email}</p>
    </div>
</body>
</html>
    `.trim();
  }

  // Generate Intake Checklist
  generateIntakeChecklist(veteranData) {
    const currentDate = new Date().toLocaleDateString();
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Forward Horizon Intake Checklist</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 30px;
            line-height: 1.4;
        }
        .header {
            text-align: center;
            background: #2c5530;
            color: white;
            padding: 20px;
            margin-bottom: 30px;
        }
        .section {
            margin: 25px 0;
            border: 1px solid #ddd;
            padding: 20px;
        }
        .checklist-item {
            display: flex;
            margin-bottom: 15px;
            align-items: flex-start;
        }
        .checkbox {
            width: 18px;
            height: 18px;
            border: 2px solid #2c5530;
            margin-right: 15px;
            flex-shrink: 0;
            margin-top: 2px;
        }
        .priority-high {
            background-color: #ffebee;
            border-left: 4px solid #f44336;
        }
        .priority-medium {
            background-color: #fff3e0;
            border-left: 4px solid #ff9800;
        }
        .priority-low {
            background-color: #f1f8e9;
            border-left: 4px solid #4caf50;
        }
        .info-box {
            background: #e3f2fd;
            padding: 15px;
            margin: 15px 0;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>INTAKE CHECKLIST</h1>
        <h2>${veteranData.name || 'New Resident'}</h2>
        <p>Date: ${currentDate}</p>
    </div>

    <div class="info-box">
        <strong>Resident Information:</strong><br>
        Name: ${veteranData.name || '__________________'}<br>
        Move-in Date: ${veteranData.moveInDate || '__________________'}<br>
        Case Manager: ${veteranData.caseManager || '__________________'}<br>
        Room: ${veteranData.roomNumber || '__________________'}
    </div>

    <div class="section priority-high">
        <h3>🔴 IMMEDIATE PRIORITY (First 24 Hours)</h3>
        
        <div class="checklist-item">
            <div class="checkbox"></div>
            <div><strong>Photo ID Verified:</strong> Check and copy driver's license or state ID</div>
        </div>
        
        <div class="checklist-item">
            <div class="checkbox"></div>
            <div><strong>DD-214 on File:</strong> Verify military service and discharge type</div>
        </div>
        
        <div class="checklist-item">
            <div class="checkbox"></div>
            <div><strong>Social Security Card:</strong> Copy for benefits enrollment</div>
        </div>
        
        <div class="checklist-item">
            <div class="checkbox"></div>
            <div><strong>Emergency Contact Info:</strong> Get at least one reliable contact</div>
        </div>
        
        <div class="checklist-item">
            <div class="checkbox"></div>
            <div><strong>Medical Emergency Info:</strong> Current medications, allergies, conditions</div>
        </div>
        
        <div class="checklist-item">
            <div class="checkbox"></div>
            <div><strong>Room Assignment & Keys:</strong> Issue keys and explain rules</div>
        </div>
        
        <div class="checklist-item">
            <div class="checkbox"></div>
            <div><strong>Facility Orientation:</strong> Tour of common areas, rules, emergency procedures</div>
        </div>
        
        <div class="checklist-item">
            <div class="checkbox"></div>
            <div><strong>Housing Agreement Signed:</strong> Review and sign all program agreements</div>
        </div>
    </div>

    <div class="section priority-medium">
        <h3>🟡 WEEK 1 PRIORITIES</h3>
        
        <div class="checklist-item">
            <div class="checkbox"></div>
            <div><strong>Case Management Meeting:</strong> Schedule initial assessment with case manager</div>
        </div>
        
        <div class="checklist-item">
            <div class="checkbox"></div>
            <div><strong>Individual Service Plan:</strong> Develop goals and timeline</div>
        </div>
        
        <div class="checklist-item">
            <div class="checkbox"></div>
            <div><strong>Benefits Assessment:</strong> Review VA benefits, SSI, SSDI, food stamps</div>
        </div>
        
        <div class="checklist-item">
            <div class="checkbox"></div>
            <div><strong>Healthcare Connection:</strong> VA enrollment or local health services</div>
        </div>
        
        <div class="checklist-item">
            <div class="checkbox"></div>
            <div><strong>Mental Health Screening:</strong> Basic assessment and resource connection</div>
        </div>
        
        <div class="checklist-item">
            <div class="checkbox"></div>
            <div><strong>Employment Discussion:</strong> Work history, goals, barriers</div>
        </div>
        
        <div class="checklist-item">
            <div class="checkbox"></div>
            <div><strong>House Rules Review:</strong> Go over detailed policies and expectations</div>
        </div>
        
        <div class="checklist-item">
            <div class="checkbox"></div>
            <div><strong>Bank Account Setup:</strong> Help establish banking for benefits</div>
        </div>
    </div>

    <div class="section priority-low">
        <h3>🟢 MONTH 1 GOALS</h3>
        
        <div class="checklist-item">
            <div class="checkbox"></div>
            <div><strong>Benefits Applications Filed:</strong> Submit all appropriate benefit applications</div>
        </div>
        
        <div class="checklist-item">
            <div class="checkbox"></div>
            <div><strong>Job Search Plan:</strong> Resume, applications, interview preparation</div>
        </div>
        
        <div class="checklist-item">
            <div class="checkbox"></div>
            <div><strong>Life Skills Assessment:</strong> Budget, cooking, cleaning, transportation</div>
        </div>
        
        <div class="checklist-item">
            <div class="checkbox"></div>
            <div><strong>Community Integration:</strong> Local resources, library card, etc.</div>
        </div>
        
        <div class="checklist-item">
            <div class="checkbox"></div>
            <div><strong>Legal Issues Review:</strong> Outstanding fines, court dates, child support</div>
        </div>
        
        <div class="checklist-item">
            <div class="checkbox"></div>
            <div><strong>Transportation Plan:</strong> Bus passes, bike, eventual vehicle</div>
        </div>
        
        <div class="checklist-item">
            <div class="checkbox"></div>
            <div><strong>Social Connections:</strong> Family contact, peer relationships, activities</div>
        </div>
        
        <div class="checklist-item">
            <div class="checkbox"></div>
            <div><strong>Housing Goals:</strong> Long-term housing plan and timeline</div>
        </div>
    </div>

    <div class="section">
        <h3>📝 NOTES & FOLLOW-UP</h3>
        <div style="border: 1px solid #ccc; min-height: 200px; padding: 10px;">
            <!-- Space for handwritten notes -->
        </div>
        
        <div style="margin-top: 30px;">
            <p><strong>Case Manager Signature:</strong> _________________________ <strong>Date:</strong> _____________</p>
            <p><strong>Resident Signature:</strong> _________________________ <strong>Date:</strong> _____________</p>
        </div>
    </div>

    <div style="margin-top: 30px; text-align: center; font-size: 11px; color: #666;">
        <p>Forward Horizon Transitional Housing | ${CONFIG.phone} | ${CONFIG.email}</p>
    </div>
</body>
</html>
    `.trim();
  }

  // Email Service
  async sendEmail(to, subject, htmlContent, attachments = []) {
    // This would integrate with your existing email service
    // For now, returning the email data structure
    return {
      to: to,
      from: CONFIG.email,
      subject: subject,
      html: htmlContent,
      attachments: attachments,
      timestamp: new Date().toISOString()
    };
  }

  // Generate Document Package
  async generateDocumentPackage(veteranData) {
    console.log(`🏠 Generating document package for ${veteranData.name}...`);
    
    const documents = {
      welcomeLetter: this.generateWelcomeLetter(veteranData),
      housingAgreement: this.generateHousingAgreement(veteranData),
      intakeChecklist: this.generateIntakeChecklist(veteranData)
    };

    // Save documents to files
    const timestamp = new Date().toISOString().split('T')[0];
    const veteranFolder = `documents/${veteranData.name?.replace(/\s+/g, '_')}_${timestamp}`;
    
    if (!fs.existsSync('documents')) {
      fs.mkdirSync('documents');
    }
    if (!fs.existsSync(veteranFolder)) {
      fs.mkdirSync(veteranFolder);
    }

    // Write HTML files
    fs.writeFileSync(`${veteranFolder}/welcome_letter.html`, documents.welcomeLetter);
    fs.writeFileSync(`${veteranFolder}/housing_agreement.html`, documents.housingAgreement);
    fs.writeFileSync(`${veteranFolder}/intake_checklist.html`, documents.intakeChecklist);

    console.log(`✅ Documents generated in ${veteranFolder}`);

    // Generate email to send to veteran
    const emailContent = `
      <h2>Welcome to Forward Horizon!</h2>
      <p>Dear ${veteranData.name},</p>
      <p>Attached are your welcome documents for Forward Horizon transitional housing:</p>
      <ul>
        <li>Welcome Letter with important information</li>
        <li>Housing Agreement to review and sign</li>
        <li>Intake Checklist for your reference</li>
      </ul>
      <p>Please review these documents before your move-in date: <strong>${veteranData.moveInDate}</strong></p>
      <p>Questions? Call us at ${CONFIG.phone}</p>
      <p>We look forward to supporting you on your journey!</p>
      <p>The Forward Horizon Team</p>
    `;

    return {
      documents,
      emailData: await this.sendEmail(
        veteranData.email,
        'Welcome to Forward Horizon - Your Housing Documents',
        emailContent,
        [
          `${veteranFolder}/welcome_letter.html`,
          `${veteranFolder}/housing_agreement.html`,
          `${veteranFolder}/intake_checklist.html`
        ]
      ),
      filesGenerated: [
        `${veteranFolder}/welcome_letter.html`,
        `${veteranFolder}/housing_agreement.html`, 
        `${veteranFolder}/intake_checklist.html`
      ]
    };
  }
}

// Express server for webhook endpoint
import express from 'express';
const app = express();
app.use(express.json());

const documentGenerator = new ForwardHorizonDocuments();

// Webhook endpoint for document generation
app.post('/generate-documents', async (req, res) => {
  try {
    const veteranData = req.body;
    
    // Validate required fields
    if (!veteranData.name || !veteranData.email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name and email'
      });
    }

    // Generate documents
    const result = await documentGenerator.generateDocumentPackage(veteranData);
    
    console.log(`📧 Document package generated for ${veteranData.name}`);
    
    res.json({
      success: true,
      message: `Document package generated for ${veteranData.name}`,
      documents: result.filesGenerated,
      emailSent: result.emailData.to
    });

  } catch (error) {
    console.error('Document generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'Forward Horizon Document Generator',
    timestamp: new Date().toISOString()
  });
});

// Start server if running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 Forward Horizon Document Generator running on port ${PORT}`);
    console.log(`📝 Generate documents: POST /generate-documents`);
    console.log(`❤️  Health check: GET /health`);
  });
}

export default ForwardHorizonDocuments;