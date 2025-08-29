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
          error: 'Missing required fields: donorName, email, amount',
          received: { donorName: !!donorName, email: !!email, amount: !!amount },
          example: {
            donorName: 'Sarah Johnson',
            email: 'sarah@email.com',
            amount: '100'
          },
          help: 'Use /api/docs?section=core-apis for complete documentation'
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email format',
          received: email,
          example: 'sarah@email.com'
        });
      }

      // Validate amount
      const donationAmount = parseFloat(amount);
      if (isNaN(donationAmount) || donationAmount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid donation amount',
          received: amount,
          example: '100'
        });
      }

      // Generate receipt number
      const receiptNumber = `FH-${Date.now()}`;
      
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