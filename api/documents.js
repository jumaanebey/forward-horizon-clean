export default function handler(req, res) {
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
    const { name, email, phone, moveInDate } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name and email',
        received: { name: !!name, email: !!email, phone: !!phone, moveInDate: !!moveInDate },
        example: {
          name: 'John Smith',
          email: 'john@email.com',
          phone: '(555) 123-4567',
          moveInDate: '2025-03-15'
        },
        help: 'Use /api/docs for complete documentation'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
        received: email,
        example: 'john@email.com'
      });
    }

    // Generate document package
    const documents = {
      welcomeLetter: {
        title: `Welcome Letter - ${name}`,
        content: `Welcome to Forward Horizon, ${name}. We're here to support your journey to independence.`,
        generated: new Date().toISOString()
      },
      housingAgreement: {
        title: `Housing Agreement - ${name}`,
        content: `Housing agreement prepared for ${name} with move-in date ${moveInDate || 'TBD'}.`,
        generated: new Date().toISOString()
      },
      intakeChecklist: {
        title: `Intake Checklist - ${name}`,
        content: `Complete intake checklist for ${name} including all required documentation.`,
        generated: new Date().toISOString()
      }
    };

    const emailData = {
      to: email,
      subject: `Welcome to Forward Horizon - ${name}`,
      body: `Dear ${name}, your document package has been generated and will be sent shortly. We look forward to supporting you on your journey.`
    };

    return res.status(200).json({
      success: true,
      message: `Document package generated for ${name}`,
      documents,
      emailData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Document generation error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}