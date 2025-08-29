
const DonorAutomation = require('../../workflows/donor-automation.cjs');

const donorSystem = new DonorAutomation();

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const result = await donorSystem.processDonation(req.body);
      res.json({
        success: true,
        message: `Thank you package generated for ${req.body.donorName}`,
        documents: {
          thankYouLetter: result.thankYouLetter,
          taxReceipt: result.taxReceipt
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  } else if (req.method === 'GET') {
    // Return analytics
    res.json(donorSystem.getDonorAnalytics());
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
