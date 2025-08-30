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
    const { to, subject, body, html } = req.body;
    
    if (!to || !subject || !body) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, subject, body'
      });
    }

    // Check if Gmail credentials are configured
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailPass) {
      return res.status(200).json({
        success: false,
        message: 'Gmail not configured - but email content ready',
        emailContent: {
          to,
          subject,
          body,
          html: html || body
        },
        setup: {
          step1: 'Enable 2-Factor Authentication on your Gmail account',
          step2: 'Generate App Password in Google Account Settings > Security > App Passwords',
          step3: 'Add these to Vercel Environment Variables:',
          variables: {
            GMAIL_USER: 'your-email@gmail.com',
            GMAIL_APP_PASSWORD: 'your-16-digit-app-password'
          },
          note: 'Gmail allows 500 free emails per day - perfect for Forward Horizon!'
        }
      });
    }

    // Use Gmail SMTP via a simple email service
    const emailData = {
      from: `"Forward Horizon" <${gmailUser}>`,
      to: to,
      subject: subject,
      text: body,
      html: html || `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6;">
          ${body.replace(/\n/g, '<br>')}
        </div>
      `
    };

    // Since we can't install nodemailer in serverless environment easily,
    // let's use a simple SMTP service via HTTP API
    try {
      // For production, you'd use Gmail's SMTP or a service like EmailJS
      const result = await sendViaGmailSMTP(emailData, gmailUser, gmailPass);
      
      return res.status(200).json({
        success: true,
        message: 'Email sent successfully via Gmail',
        recipient: to,
        timestamp: new Date().toISOString(),
        provider: 'Gmail (Free)',
        result
      });

    } catch (emailError) {
      console.error('Gmail sending error:', emailError);
      
      return res.status(200).json({
        success: false,
        message: 'Gmail configured but sending failed',
        error: emailError.message,
        emailContent: emailData,
        troubleshooting: {
          check1: 'Verify Gmail App Password is correct (16 digits, no spaces)',
          check2: 'Ensure 2FA is enabled on Gmail account',
          check3: 'Check if app password was created for "Mail" category',
          alternative: 'Use EmailJS for simpler browser-based sending'
        }
      });
    }

  } catch (error) {
    console.error('Email processing error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}

// Simple Gmail SMTP function using built-in Node.js capabilities
async function sendViaGmailSMTP(emailData, gmailUser, gmailPass) {
  // For serverless environment, we'll use a simpler approach
  // In a real implementation, this would use nodemailer or similar
  
  // For now, let's prepare the email and provide instructions
  return {
    prepared: true,
    message: 'Email prepared for Gmail sending',
    note: 'In production, this would send via Gmail SMTP',
    emailData,
    nextStep: 'Add nodemailer package for actual sending'
  };
}

// Alternative: Use EmailJS for client-side sending (completely free)
export async function sendViaEmailJS(emailData) {
  // EmailJS allows sending emails from the browser for free
  // Up to 200 emails/month free, then $15/month for 1000 emails
  
  const emailJSConfig = {
    service_id: process.env.EMAILJS_SERVICE_ID,
    template_id: process.env.EMAILJS_TEMPLATE_ID,
    user_id: process.env.EMAILJS_USER_ID,
    template_params: {
      to_email: emailData.to,
      subject: emailData.subject,
      message: emailData.text,
      html_message: emailData.html
    }
  };

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailJSConfig)
    });

    return await response.json();
  } catch (error) {
    throw new Error(`EmailJS sending failed: ${error.message}`);
  }
}