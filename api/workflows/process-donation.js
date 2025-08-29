module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { donorName, email, amount } = req.body;
      
      if (!donorName || !email || !amount) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: donorName, email, amount'
        });
      }

      // Process donation (simplified)
      const receiptNumber = `FH-${Date.now()}`;
      
      const documents = {
        thankYouLetter: `Thank you letter generated for ${donorName}`,
        taxReceipt: `Tax receipt ${receiptNumber} for $${amount}`
      };

      res.json({
        success: true,
        message: `Thank you package generated for ${donorName}`,
        documents,
        receiptNumber,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  } else if (req.method === 'GET') {
    // Return sample analytics
    res.json({
      totalDonors: 247,
      totalDonations: 85420,
      averageDonation: 346,
      monthlyGrowth: 12.5
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};