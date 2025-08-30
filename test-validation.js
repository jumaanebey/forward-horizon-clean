// Test the validation logic locally

const sanitizeInput = (input) => {
  if (typeof input !== 'string' || !input) return null; // Return null for non-strings or falsy values
  const result = input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
  return result || null; // Convert empty strings to null for validation
};

// Test cases
const testCases = [
  {},
  {firstName: "", lastName: "", email: "", message: ""},
  {firstName: undefined, lastName: undefined, email: undefined, message: undefined},
  {message: ""},
  {firstName: "Test", lastName: "User", email: "test@example.com", message: ""}
];

testCases.forEach((testCase, i) => {
  console.log(`\nTest Case ${i + 1}:`, testCase);
  
  const { firstName, lastName, email, phone, service, message, consent } = testCase;
  
  const sanitizedData = {
    firstName: sanitizeInput(firstName),
    lastName: sanitizeInput(lastName),
    email: sanitizeInput(email),
    phone: sanitizeInput(phone),
    service: sanitizeInput(service),
    message: sanitizeInput(message),
    consent
  };
  
  console.log('Sanitized:', sanitizedData);
  
  // Validation
  const missingFields = [];
  if (!sanitizedData.firstName) missingFields.push('firstName');
  if (!sanitizedData.lastName) missingFields.push('lastName');
  if (!sanitizedData.email) missingFields.push('email');
  if (!sanitizedData.message) missingFields.push('message');
  
  console.log('Missing fields:', missingFields);
  console.log('Should fail validation:', missingFields.length > 0);
});