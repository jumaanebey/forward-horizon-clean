/**
 * Enhanced Form Handler with Email Integration
 * Processes contact form submissions and sends notifications
 */

export default async function handler(req, res) {
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
    // Extract form data
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      service, 
      message,
      consent 
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['firstName', 'lastName', 'email', 'message']
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Store form submission data
    const submissionData = {
      name: `${firstName} ${lastName}`,
      email,
      phone: phone || 'Not provided',
      service: service || 'General Inquiry',
      message,
      consent: consent === 'on' || consent === true,
      timestamp: new Date().toISOString(),
      source: req.headers.referer || 'Direct submission'
    };

    // Prepare notification emails
    const emailNotifications = [];

    // 1. Send confirmation email to submitter
    const confirmationEmail = {
      to: email,
      subject: `Thank you for contacting Forward Horizon, ${firstName}`,
      body: `Dear ${firstName},\n\nThank you for reaching out to Forward Horizon. We have received your message and will respond within 24 hours.\n\nYour Message:\n${message}\n\nService Requested: ${service || 'General Inquiry'}\n\nBest regards,\nForward Horizon Team\n(310) 488-5280`,
      html: generateConfirmationEmail(submissionData)
    };

    // 2. Send notification to admin
    const adminEmail = {
      to: process.env.ADMIN_EMAIL || 'info@theforwardhorizon.com',
      subject: `New Contact Form Submission from ${firstName} ${lastName}`,
      body: `New contact form submission received:\n\nName: ${firstName} ${lastName}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\nService: ${service || 'General Inquiry'}\n\nMessage:\n${message}\n\nSubmitted: ${submissionData.timestamp}`,
      html: generateAdminNotification(submissionData)
    };

    // Try to send emails using free email service
    let emailResults = { confirmation: null, admin: null };
    
    try {
      // Send confirmation email
      const confirmResponse = await fetch(`${req.headers.host ? `https://${req.headers.host}` : 'http://localhost:3000'}/api/email-free`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(confirmationEmail)
      });
      emailResults.confirmation = await confirmResponse.json();

      // Send admin notification
      const adminResponse = await fetch(`${req.headers.host ? `https://${req.headers.host}` : 'http://localhost:3000'}/api/email-free`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminEmail)
      });
      emailResults.admin = await adminResponse.json();
    } catch (emailError) {
      console.log('Email service error:', emailError.message);
    }

    // Try N8N webhook if configured (backwards compatibility)
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    if (n8nWebhookUrl && n8nWebhookUrl !== 'https://your-n8n.cloud/webhook/forward-horizon') {
      try {
        await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ body: submissionData })
        });
      } catch (error) {
        console.log('N8N webhook error:', error.message);
      }
    }

    // Return success response
    return res.status(200).json({ 
      success: true, 
      message: 'Thank you! We will contact you within 24 hours.',
      received: true,
      submission: {
        name: submissionData.name,
        service: submissionData.service,
        timestamp: submissionData.timestamp
      },
      emailStatus: {
        confirmation: emailResults.confirmation?.success || false,
        admin: emailResults.admin?.success || false
      }
    });

  } catch (error) {
    console.error('Form submission error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error processing your submission',
      message: 'Please try again or call us at (310) 488-5280'
    });
  }
}

function generateConfirmationEmail(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2c5530; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
        .info-box { background: #f0f9ff; padding: 15px; border-left: 4px solid #2c5530; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏠 Thank You for Contacting Forward Horizon</h1>
        </div>
        <div class="content">
          <h2>Hello ${data.name.split(' ')[0]},</h2>
          <p>We have received your message and appreciate you reaching out to Forward Horizon.</p>
          
          <div class="info-box">
            <h3>Your Submission Details:</h3>
            <p><strong>Service Requested:</strong> ${data.service}</p>
            <p><strong>Your Message:</strong><br>${data.message.replace(/\n/g, '<br>')}</p>
          </div>
          
          <h3>What Happens Next?</h3>
          <ul>
            <li>Our team will review your message within 24 hours</li>
            <li>We'll contact you via email or phone with next steps</li>
            <li>If urgent, please call us at (310) 488-5280</li>
          </ul>
          
          <p><strong>We're here to support you on your journey!</strong></p>
        </div>
        <div class="footer">
          <p><strong>Forward Horizon Transitional Housing</strong><br>
          Los Angeles, CA<br>
          (310) 488-5280 | info@theforwardhorizon.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateAdminNotification(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
        .content { background: white; padding: 20px; border: 1px solid #e0e0e0; }
        .field { margin: 10px 0; padding: 10px; background: #f9f9f9; }
        .priority { background: #fef2f2; border-left: 4px solid #dc2626; padding: 10px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>⚡ New Contact Form Submission</h2>
        </div>
        <div class="content">
          <div class="priority">
            <strong>Action Required:</strong> New inquiry received - please respond within 24 hours
          </div>
          
          <div class="field">
            <strong>Name:</strong> ${data.name}
          </div>
          <div class="field">
            <strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a>
          </div>
          <div class="field">
            <strong>Phone:</strong> ${data.phone}
          </div>
          <div class="field">
            <strong>Service Requested:</strong> ${data.service}
          </div>
          <div class="field">
            <strong>Message:</strong><br>
            ${data.message.replace(/\n/g, '<br>')}
          </div>
          <div class="field">
            <strong>Consent to Contact:</strong> ${data.consent ? 'Yes' : 'No'}
          </div>
          <div class="field">
            <strong>Submitted:</strong> ${new Date(data.timestamp).toLocaleString()}
          </div>
          <div class="field">
            <strong>Source:</strong> ${data.source}
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}