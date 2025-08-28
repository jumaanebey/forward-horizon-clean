/**
 * Simplified Form Handler for N8N Integration
 * All complex logic moves to N8N workflows
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Simply forward to N8N webhook
  try {
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'https://your-n8n.cloud/webhook/forward-horizon';
    
    // Add metadata
    const payload = {
      ...req.body,
      timestamp: new Date().toISOString(),
      source: req.headers.referer || 'direct',
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
    };

    // Send to N8N
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      return res.status(200).json({ 
        success: true, 
        message: 'Thank you! We will contact you within 24 hours.' 
      });
    } else {
      throw new Error('Workflow processing failed');
    }
  } catch (error) {
    console.error('N8N submission error:', error);
    // Fallback - still accept the form
    return res.status(200).json({ 
      success: true, 
      message: 'Thank you for your submission. If you don\'t hear from us within 24 hours, please call (310) 488-5280.' 
    });
  }
}