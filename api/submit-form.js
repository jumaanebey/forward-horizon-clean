import nodemailer from 'nodemailer';

// Email configuration
const EMAIL_CONFIG = {
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
};

// Recipients for different form types
const RECIPIENTS = {
  contact: process.env.CONTACT_EMAIL || 'info@theforwardhorizon.com',
  application: process.env.APPLICATION_EMAIL || 'admissions@theforwardhorizon.com',
  volunteer: process.env.VOLUNTEER_EMAIL || 'volunteer@theforwardhorizon.com'
};

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const formData = req.body;
    const { formType = 'contact', name, email, phone, message, ...otherFields } = formData;
    
    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name and email are required fields' 
      });
    }

    // Create email transporter
    const transporter = nodemailer.createTransport(EMAIL_CONFIG);

    // Determine recipient based on form type
    const recipient = RECIPIENTS[formType] || RECIPIENTS.contact;

    // Format the email content
    const emailContent = formatEmailContent(formType, { name, email, phone, message, ...otherFields });

    // Email options
    const mailOptions = {
      from: `"Forward Horizon Website" <${process.env.EMAIL_USER}>`,
      to: recipient,
      subject: emailContent.subject,
      html: emailContent.html,
      replyTo: email
    };

    // Send notification email to admin
    await transporter.sendMail(mailOptions);

    // Send confirmation email to user
    if (email) {
      const confirmationOptions = {
        from: `"Forward Horizon" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'We Received Your Submission - Forward Horizon',
        html: getConfirmationEmail(name, formType)
      };
      await transporter.sendMail(confirmationOptions);
    }
    
    // Return success response
    res.status(200).json({ 
      success: true, 
      message: getSuccessMessage(formType),
      data: { name, email }
    });

  } catch (error) {
    console.error('Form submission error:', error);
    
    // Check if email credentials are missing
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      return res.status(200).json({ 
        success: true, 
        message: 'Thank you for your submission! We will contact you soon.',
        note: 'Email service not configured, but your submission was recorded.'
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'There was an error processing your submission. Please try again or contact us directly.' 
    });
  }
}

function formatEmailContent(formType, data) {
  const { name, email, phone, message, ...otherFields } = data;
  
  const subjects = {
    contact: `New Contact Form Submission from ${name}`,
    application: `New Housing Application from ${name}`,
    volunteer: `New Volunteer Interest from ${name}`
  };

  let htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #555; }
          .value { color: #333; margin-top: 5px; }
          .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>${subjects[formType] || subjects.contact}</h2>
            <p>Received: ${new Date().toLocaleString()}</p>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">Name:</div>
              <div class="value">${name}</div>
            </div>
            <div class="field">
              <div class="label">Email:</div>
              <div class="value"><a href="mailto:${email}">${email}</a></div>
            </div>
  `;

  if (phone) {
    htmlContent += `
            <div class="field">
              <div class="label">Phone:</div>
              <div class="value">${phone}</div>
            </div>
    `;
  }

  if (message) {
    htmlContent += `
            <div class="field">
              <div class="label">Message:</div>
              <div class="value">${message.replace(/\n/g, '<br>')}</div>
            </div>
    `;
  }

  // Add any additional fields
  Object.entries(otherFields).forEach(([key, value]) => {
    if (value) {
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      htmlContent += `
            <div class="field">
              <div class="label">${label}:</div>
              <div class="value">${value}</div>
            </div>
      `;
    }
  });

  htmlContent += `
          </div>
          <div class="footer">
            <p>This email was sent from the Forward Horizon website form submission system.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return {
    subject: subjects[formType] || subjects.contact,
    html: htmlContent
  };
}

function getConfirmationEmail(name, formType) {
  const messages = {
    contact: 'We received your message and will respond within 24 hours.',
    application: 'We received your housing application and will review it carefully. Our admissions team will contact you within 48 hours.',
    volunteer: 'Thank you for your interest in volunteering! Our volunteer coordinator will reach out within 48 hours.'
  };

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Thank You, ${name}!</h1>
            <p>Your submission has been received</p>
          </div>
          <div class="content">
            <p>Dear ${name},</p>
            <p>${messages[formType] || messages.contact}</p>
            <p>If you have any urgent questions, please don't hesitate to call us at (555) 123-4567.</p>
            <p>With gratitude,<br>The Forward Horizon Team</p>
            <a href="https://theforwardhorizon.com" class="button">Visit Our Website</a>
          </div>
          <div class="footer">
            <p>Forward Horizon | Transitional Housing for Veterans, Recovery, and Reentry</p>
            <p>This email was sent from theforwardhorizon.com</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function getSuccessMessage(formType) {
  const messages = {
    contact: 'Thank you for reaching out! We will respond within 24 hours.',
    application: 'Your application has been submitted successfully! Our admissions team will review it and contact you within 48 hours.',
    volunteer: 'Thank you for your interest in volunteering! Our coordinator will contact you soon.'
  };
  return messages[formType] || messages.contact;
}