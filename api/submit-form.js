/**
 * Simplified Form Handler for N8N Integration
 * All complex logic moves to N8N workflows
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Log the submission
  console.log('Form submission received:', req.body);

  // Simply forward to N8N webhook if available
  const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
  
  if (n8nWebhookUrl && n8nWebhookUrl !== 'https://your-n8n.cloud/webhook/forward-horizon') {
    try {
      // Add metadata and wrap in body for N8N
      const payload = {
        body: {
          ...req.body,
          timestamp: new Date().toISOString(),
          source: req.headers.referer || 'direct'
        }
      };

      // Send to N8N
      const response = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        console.error('N8N webhook returned:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('N8N webhook error:', error.message);
    }
  }

  // Always return success to the user
  return res.status(200).json({ 
    success: true, 
    message: 'Thank you! We will contact you within 24 hours.',
    received: true
  });
}