module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // System health check
  const status = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      documentGenerator: 'active',
      donorAutomation: 'active', 
      appointmentSystem: 'active'
    },
    environment: process.env.NODE_ENV || 'production',
    region: process.env.VERCEL_REGION || 'us-west-1'
  };

  res.json(status);
};