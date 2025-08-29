
import ForwardHorizonDocuments from '../../workflows/document-generator.js';

const documentGenerator = new ForwardHorizonDocuments();

export default async function handler(req, res) {
  // Enable CORS
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
    const veteranData = req.body;
    
    if (!veteranData.name || !veteranData.email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name and email'
      });
    }

    const result = await documentGenerator.generateDocumentPackage(veteranData);
    
    res.json({
      success: true,
      message: `Document package generated for ${veteranData.name}`,
      documents: result.documents,
      emailData: result.emailData
    });

  } catch (error) {
    console.error('Document generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
