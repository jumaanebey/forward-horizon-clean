// Utility function for API retry logic
async function apiRetry(fn, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
}

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

    // Option 1: Try Web3Forms first (we have a key configured) with retry logic
    try {
      const result = await apiRetry(async () => {
        return await sendViaWeb3Forms({ to, subject, body, html });
      });
      
      if (result && result.success) {
        return res.status(200).json({
          success: true,
          message: 'Email sent successfully via Web3Forms (Free)',
          recipient: to,
          provider: 'Web3Forms (Free)',
          timestamp: new Date().toISOString(),
          result
        });
      }
    } catch (error) {
      console.log('Web3Forms failed after retries, trying next option:', error.message);
    }

    // Option 2: Use Resend Free Tier (3,000 emails/month free)
    if (process.env.RESEND_API_KEY) {
      try {
        const result = await sendViaResend({ to, subject, body, html });
        return res.status(200).json({
          success: true,
          message: 'Email sent successfully via Resend (Free)',
          recipient: to,
          provider: 'Resend Free Tier',
          timestamp: new Date().toISOString(),
          result
        });
      } catch (error) {
        console.log('Resend failed, trying next option:', error.message);
      }
    }

    // Option 3: Use EmailJS (200 emails/month free, client-side)
    if (process.env.EMAILJS_SERVICE_ID) {
      try {
        const result = await sendViaEmailJS({ to, subject, body, html });
        return res.status(200).json({
          success: true,
          message: 'Email sent successfully via EmailJS (Free)',
          recipient: to,
          provider: 'EmailJS Free Tier',
          timestamp: new Date().toISOString(),
          result
        });
      } catch (error) {
        console.log('EmailJS failed:', error.message);
      }
    }

    // If all fail, provide setup instructions
    return res.status(200).json({
      success: false,
      message: 'No free email service configured',
      emailPrepared: {
        to, subject, body, 
        html: html || generateSimpleHTML(body)
      },
      freeOptions: {
        option1: {
          name: 'Resend Free Tier',
          limit: '3,000 emails/month FREE',
          setup: 'Sign up at resend.com, get API key, add RESEND_API_KEY to Vercel',
          time: '2 minutes'
        },
        option2: {
          name: 'EmailJS',
          limit: '200 emails/month FREE',
          setup: 'Sign up at emailjs.com, get service ID, add EMAILJS_SERVICE_ID to Vercel',
          time: '3 minutes'
        },
        option3: {
          name: 'Web3Forms',
          limit: 'Unlimited FREE (with their branding)',
          setup: 'Get access key from web3forms.com',
          time: '1 minute'
        }
      },
      quickStart: {
        easiest: 'Web3Forms - works instantly with just an access key',
        most_generous: 'Resend - 3,000 free emails/month',
        note: 'All options are completely free and work great for Forward Horizon'
      }
    });

  } catch (error) {
    console.error('Email processing error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Resend Free Tier (3,000 emails/month)
async function sendViaResend({ to, subject, body, html }) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Forward Horizon <noreply@theforwardhorizon.com>',
      to: [to],
      subject: subject,
      html: html || generateSimpleHTML(body),
      text: body
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend API error: ${response.status}`);
  }

  return await response.json();
}

// EmailJS (200 emails/month free)
async function sendViaEmailJS({ to, subject, body, html }) {
  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_TEMPLATE_ID || 'default',
      user_id: process.env.EMAILJS_USER_ID,
      template_params: {
        to_email: to,
        subject: subject,
        message: body,
        html_message: html || generateSimpleHTML(body)
      }
    })
  });

  if (!response.ok) {
    throw new Error(`EmailJS API error: ${response.status}`);
  }

  return { sent: true, service: 'EmailJS' };
}

// Web3Forms (Unlimited free with branding)
async function sendViaWeb3Forms({ to, subject, body, html }) {
  const formData = new FormData();
  // Try the provided key or fall back to environment variable
  formData.append('access_key', process.env.WEB3FORMS_ACCESS_KEY || 'd7b3dbb2-0d33-4353-ba5a-479dbf0e5a79');
  formData.append('email', to);
  formData.append('subject', subject);
  formData.append('message', html || body);
  formData.append('from_name', 'Forward Horizon Transitional Housing');

  const response = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Web3Forms API error: ${response.status}`);
  }

  return await response.json();
}

function generateSimpleHTML(text) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2c5530; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>🏠 Forward Horizon</h2>
      </div>
      <div class="content">
        ${text.replace(/\n/g, '<br>')}
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #666; text-align: center;">
          Forward Horizon Transitional Housing<br>
          (310) 488-5280 | info@theforwardhorizon.com
        </p>
      </div>
    </body>
    </html>
  `;
}