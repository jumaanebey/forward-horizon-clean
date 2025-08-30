/**
 * Enhanced Form Handler with Email Integration
 * Processes contact form submissions and sends notifications
 */

// Improved rate limiting with better logic
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes (reduced from 15)
const RATE_LIMIT_MAX = 3; // 3 submissions per 10 minutes per IP (reduced from 5)

function checkRateLimit(ip) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }
  
  const requests = rateLimitMap.get(ip);
  // Remove old requests outside the window
  const recentRequests = requests.filter(time => time > windowStart);
  
  if (recentRequests.length >= RATE_LIMIT_MAX) {
    return false; // Rate limit exceeded
  }
  
  // Add current request
  recentRequests.push(now);
  rateLimitMap.set(ip, recentRequests);
  return true;
}

// Cleanup old rate limit data every 30 minutes
setInterval(() => {
  const now = Date.now();
  const cutoff = now - RATE_LIMIT_WINDOW * 2; // Keep data for 2x the window
  
  for (const [ip, requests] of rateLimitMap.entries()) {
    const validRequests = requests.filter(time => time > cutoff);
    if (validRequests.length === 0) {
      rateLimitMap.delete(ip);
    } else {
      rateLimitMap.set(ip, validRequests);
    }
  }
}, 30 * 60 * 1000);

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

  // Enhanced rate limiting with better IP detection
  let clientIP = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
                 req.headers['x-real-ip'] || 
                 req.connection?.remoteAddress || 
                 req.socket?.remoteAddress ||
                 req.ip ||
                 'unknown';
  
  // Clean up IPv6 localhost
  if (clientIP === '::ffff:127.0.0.1') {
    clientIP = '127.0.0.1';
  }
  
  // For development and unknown IPs, use a unique identifier per session
  const isLocalDev = clientIP === '127.0.0.1' || clientIP === '::1' || clientIP.startsWith('192.168.') || clientIP === 'unknown';
  
  if (isLocalDev) {
    // Use user agent + timestamp for local development to allow testing
    clientIP = `dev-${req.headers['user-agent']?.slice(-10) || 'unknown'}-${Date.now()}`;
  }
  
  if (!checkRateLimit(clientIP)) {
    console.log(`Rate limited IP: ${clientIP}`);
    return res.status(429).json({
      success: false,
      error: 'Too many submissions',
      message: 'Please wait 10 minutes before submitting another form. For urgent inquiries, call (310) 488-5280.',
      retryAfter: 600, // 10 minutes in seconds
      debug: { clientIP, isLocalDev }
    });
  }

  try {
    // Extract and sanitize form data
    const sanitizeInput = (input) => {
      if (typeof input !== 'string') return input;
      return input
        .trim()
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .substring(0, 1000); // Limit length
    };

    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      service, 
      message,
      consent 
    } = req.body;

    // Sanitize all string inputs
    const sanitizedData = {
      firstName: sanitizeInput(firstName),
      lastName: sanitizeInput(lastName),
      email: sanitizeInput(email),
      phone: sanitizeInput(phone),
      service: sanitizeInput(service),
      message: sanitizeInput(message),
      consent
    };

    // Validate required fields using sanitized data
    if (!sanitizedData.firstName || !sanitizedData.lastName || !sanitizedData.email || !sanitizedData.message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['firstName', 'lastName', 'email', 'message']
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedData.email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Additional validation
    if (sanitizedData.firstName.length < 1 || sanitizedData.lastName.length < 1) {
      return res.status(400).json({
        success: false,
        error: 'Name fields cannot be empty'
      });
    }

    if (sanitizedData.message.length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Message must be at least 10 characters long'
      });
    }

    // Store form submission data using sanitized inputs
    const submissionData = {
      name: `${sanitizedData.firstName} ${sanitizedData.lastName}`,
      email: sanitizedData.email,
      phone: sanitizedData.phone || 'Not provided',
      service: sanitizedData.service || 'General Inquiry',
      message: sanitizedData.message,
      consent: sanitizedData.consent === 'on' || sanitizedData.consent === true,
      timestamp: new Date().toISOString(),
      source: req.headers.referer || 'Direct submission'
    };

    // Prepare notification emails
    const emailNotifications = [];

    // 1. Send confirmation email to submitter
    const confirmationEmail = {
      to: sanitizedData.email,
      subject: `Thank you for contacting Forward Horizon, ${sanitizedData.firstName}`,
      body: `Dear ${sanitizedData.firstName},\n\nThank you for reaching out to Forward Horizon. We have received your message and will respond within 24 hours.\n\nYour Message:\n${sanitizedData.message}\n\nService Requested: ${sanitizedData.service || 'General Inquiry'}\n\nBest regards,\nForward Horizon Team\n(310) 488-5280`,
      html: generateConfirmationEmail(submissionData)
    };

    // 2. Send notification to admin
    const adminEmail = {
      to: process.env.ADMIN_EMAIL || 'info@theforwardhorizon.com',
      subject: `New Contact Form Submission from ${submissionData.name}`,
      body: `New contact form submission received:\n\nName: ${submissionData.name}\nEmail: ${sanitizedData.email}\nPhone: ${sanitizedData.phone || 'Not provided'}\nService: ${sanitizedData.service || 'General Inquiry'}\n\nMessage:\n${sanitizedData.message}\n\nSubmitted: ${submissionData.timestamp}`,
      html: generateAdminNotification(submissionData)
    };

    // Send emails in parallel for better performance
    let emailResults = { confirmation: null, admin: null };
    
    try {
      // Send both emails simultaneously
      const [confirmResponse, adminResponse] = await Promise.all([
        fetch(`${req.headers.host ? `https://${req.headers.host}` : 'http://localhost:3000'}/api/email-free`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(confirmationEmail)
        }).catch(err => {
          console.error('Confirmation email error:', err);
          return { ok: false };
        }),
        fetch(`${req.headers.host ? `https://${req.headers.host}` : 'http://localhost:3000'}/api/email-free`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(adminEmail)
        }).catch(err => {
          console.error('Admin email error:', err);
          return { ok: false };
        })
      ]);

      // Parse responses
      if (confirmResponse.ok) {
        emailResults.confirmation = await confirmResponse.json();
      }
      if (adminResponse.ok) {
        emailResults.admin = await adminResponse.json();
      }
    } catch (emailError) {
      console.error('Email service error:', emailError.message);
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

// Optimized email template with cached base template
const EMAIL_BASE_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #2c5530 0%, #1e3a1e 100%); color: white; padding: 25px; text-align: center; }
    .content { background: white; padding: 25px; }
    .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
    .info-box { background: #f0f9ff; padding: 15px; border-left: 4px solid #2c5530; margin: 15px 0; border-radius: 4px; }
    .btn { display: inline-block; background: #2c5530; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
    ul { padding-left: 20px; }
    li { margin: 8px 0; }
    h1 { margin: 0; font-size: 24px; }
    h2 { color: #2c5530; margin-top: 0; }
    h3 { color: #2c5530; }
    @media (max-width: 600px) {
      .container { width: 100% !important; }
      .header, .content, .footer { padding: 15px !important; }
    }
  </style>
</head>
<body>{{BODY_CONTENT}}</body>
</html>`;

function generateConfirmationEmail(data) {
  const firstName = data.name.split(' ')[0];
  const bodyContent = `
    <div class="container">
      <div class="header">
        <h1>🏠 Thank You for Contacting Forward Horizon</h1>
      </div>
      <div class="content">
        <h2>Hello ${firstName},</h2>
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
        <a href="tel:(310)488-5280" class="btn">📞 Call Us Now</a>
      </div>
      <div class="footer">
        <p><strong>Forward Horizon Transitional Housing</strong><br>
        Los Angeles, CA | (310) 488-5280 | info@theforwardhorizon.com</p>
      </div>
    </div>`;
  
  return EMAIL_BASE_TEMPLATE.replace('{{BODY_CONTENT}}', bodyContent);
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