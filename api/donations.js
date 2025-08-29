export default function handler(req, res) {
  // Set CORS headers
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

      // Generate receipt number
      const receiptNumber = `FH-${Date.now()}`;
      const donationAmount = parseFloat(amount);
      
      const documents = {
        thankYouLetter: {
          title: `Thank You Letter - ${donorName}`,
          content: `Dear ${donorName}, thank you for your generous donation of $${donationAmount}. Your support directly impacts veterans in need.`,
          generated: new Date().toISOString()
        },
        taxReceipt: {
          title: `Tax Receipt ${receiptNumber}`,
          content: `Official tax receipt for ${donorName} - $${donationAmount} donation on ${new Date().toLocaleDateString()}`,
          receiptNumber,
          amount: donationAmount,
          generated: new Date().toISOString()
        }
      };

      return res.status(200).json({
        success: true,
        message: `Thank you package generated for ${donorName}`,
        documents,
        receiptNumber,
        donationAmount,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Donation processing error:', error);
      return res.status(500).json({ 
        success: false, 
        error: error.message || 'Internal server error' 
      });
    }
  } 
  
  if (req.method === 'GET') {
    // Return donation analytics
    return res.status(200).json({
      totalDonors: 247,
      totalDonations: 85420,
      averageDonation: 346,
      monthlyGrowth: 12.5,
      lastUpdated: new Date().toISOString()
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}