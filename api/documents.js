export default function handler(req, res) {
  // Set CORS headers
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
    const { name, email, phone, moveInDate } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name and email',
        received: { name: !!name, email: !!email, phone: !!phone, moveInDate: !!moveInDate },
        example: {
          name: 'John Smith',
          email: 'john@email.com',
          phone: '(555) 123-4567',
          moveInDate: '2025-03-15'
        },
        help: 'Use /api/docs for complete documentation'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
        received: email,
        example: 'john@email.com'
      });
    }

    // Generate document package
    const documents = {
      welcomeLetter: {
        title: `Welcome Letter - ${name}`,
        content: `Welcome to Forward Horizon, ${name}. We're here to support your journey to independence.`,
        generated: new Date().toISOString()
      },
      housingAgreement: {
        title: `Housing Agreement - ${name}`,
        content: `Housing agreement prepared for ${name} with move-in date ${moveInDate || 'TBD'}.`,
        generated: new Date().toISOString()
      },
      intakeChecklist: {
        title: `Intake Checklist - ${name}`,
        content: `Complete intake checklist for ${name} including all required documentation.`,
        generated: new Date().toISOString()
      }
    };

    const emailData = {
      to: email,
      subject: `Welcome to Forward Horizon - ${name}`,
      body: `Dear ${name}, your document package has been generated and will be sent shortly. We look forward to supporting you on your journey.`
    };

    // Attempt to send email notification
    let emailResult = null;
    try {
      const emailResponse = await fetch(`${req.headers.host ? `https://${req.headers.host}` : 'http://localhost:3000'}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: emailData.subject,
          body: emailData.body,
          html: generateWelcomeEmailHTML(name, documents)
        })
      });
      emailResult = await emailResponse.json();
    } catch (emailError) {
      console.log('Email service not available:', emailError.message);
      emailResult = {
        success: false,
        message: 'Email service not configured',
        note: 'Documents generated successfully, but email notification requires email service setup'
      };
    }

    return res.status(200).json({
      success: true,
      message: `Document package generated for ${name}`,
      documents,
      emailData,
      emailResult,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Document generation error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}

function generateWelcomeEmailHTML(name, documents) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Forward Horizon</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2c5530; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
        .document-item { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .button { background: #2c5530; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏠 Welcome to Forward Horizon!</h1>
          <p>Your journey to independence starts here</p>
        </div>
        
        <div class="content">
          <h2>Hello ${name},</h2>
          <p>We're excited to welcome you to Forward Horizon Transitional Housing! Your document package has been generated and is ready for you.</p>
          
          <h3>📋 Your Documents:</h3>
          <div class="document-item">
            <strong>📄 ${documents.welcomeLetter.title}</strong><br>
            <small>Generated: ${documents.welcomeLetter.generated}</small>
          </div>
          <div class="document-item">
            <strong>🏠 ${documents.housingAgreement.title}</strong><br>
            <small>Generated: ${documents.housingAgreement.generated}</small>
          </div>
          <div class="document-item">
            <strong>✅ ${documents.intakeChecklist.title}</strong><br>
            <small>Generated: ${documents.intakeChecklist.generated}</small>
          </div>
          
          <h3>📞 Next Steps:</h3>
          <ul>
            <li>Review your welcome letter for important information</li>
            <li>Complete and sign the housing agreement</li>
            <li>Gather all items from the intake checklist</li>
            <li>Contact us if you have any questions</li>
          </ul>
          
          <p><strong>We're here to support you every step of the way!</strong></p>
          
          <a href="tel:(310)488-5280" class="button">📞 Call Us: (310) 488-5280</a>
        </div>
        
        <div class="footer">
          <p><strong>Forward Horizon Transitional Housing</strong><br>
          1234 Veterans Way, Los Angeles, CA 90001<br>
          (310) 488-5280 | info@theforwardhorizon.com</p>
          
          <p style="font-size: 12px; color: #666; margin-top: 15px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}