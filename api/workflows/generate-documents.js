module.exports = (req, res) => {
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
    const { name, email, phone, moveInDate } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name and email'
      });
    }

    // Generate documents (simplified version)
    const documents = {
      welcomeLetter: `Welcome letter generated for ${name}`,
      housingAgreement: `Housing agreement prepared for ${name}`,
      intakeChecklist: `Intake checklist created for ${name}`
    };

    const emailData = {
      to: email,
      subject: `Welcome to Forward Horizon - ${name}`,
      body: `Your document package has been generated and will be sent shortly.`
    };

    res.json({
      success: true,
      message: `Document package generated for ${name}`,
      documents,
      emailData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Document generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};