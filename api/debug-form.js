export default async function handler(req, res) {
  // Simple debug endpoint to test validation
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { firstName, lastName, email, message } = req.body;
  
  const sanitizeInput = (input) => {
    if (typeof input !== 'string' || !input) return null;
    const result = input.trim().replace(/[<>]/g, '').substring(0, 1000);
    return result || null;
  };

  const sanitizedData = {
    firstName: sanitizeInput(firstName),
    lastName: sanitizeInput(lastName),
    email: sanitizeInput(email),
    message: sanitizeInput(message)
  };

  const missingFields = [];
  if (!sanitizedData.firstName) missingFields.push('firstName');
  if (!sanitizedData.lastName) missingFields.push('lastName');
  if (!sanitizedData.email) missingFields.push('email');
  if (!sanitizedData.message) missingFields.push('message');

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields',
      missing: missingFields,
      debug: sanitizedData
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Validation passed',
    data: sanitizedData
  });
}