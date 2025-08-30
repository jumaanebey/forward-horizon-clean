# 📚 Forward Horizon API Documentation

## 🎯 Overview
Forward Horizon provides a comprehensive suite of REST APIs for managing transitional housing operations, document generation, and communication systems.

**Base URL**: `https://forward-horizon-clean.vercel.app`  
**Authentication**: Currently open (API keys coming soon)  
**Response Format**: JSON

---

## 🔥 Quick Start

### Test the APIs
```bash
# Test document generation
curl -X POST https://your-domain.vercel.app/api/documents \
  -H "Content-Type: application/json" \
  -d '{"name":"John Smith","email":"john@example.com"}'

# Test email sending (FREE - works immediately!)
curl -X POST https://your-domain.vercel.app/api/email-free \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"Test","body":"Hello!"}'
```

---

## 📧 Email APIs

### 1. Free Email Service (`/api/email-free`)
**Method**: POST  
**Description**: Send emails using free providers (Web3Forms configured)  
**Status**: ✅ WORKING - Emails sending successfully!

#### Request Body:
```json
{
  "to": "recipient@example.com",
  "subject": "Email Subject",
  "body": "Plain text email content",
  "html": "<h1>Optional HTML content</h1>"
}
```

#### Success Response (200):
```json
{
  "success": true,
  "message": "Email sent successfully via Web3Forms (Free)",
  "recipient": "recipient@example.com",
  "provider": "Web3Forms (Free)",
  "timestamp": "2025-08-30T14:11:58.475Z",
  "result": {
    "success": true,
    "message": "Email sent successfully!"
  }
}
```

---

## 📋 Document Generation

### 2. Document Generator (`/api/documents`)
**Method**: POST  
**Description**: Generate intake documents and send welcome emails  
**Features**: Creates 3 documents + sends confirmation emails

#### Request Body:
```json
{
  "name": "John Smith",
  "email": "john@example.com",
  "phone": "(555) 123-4567",
  "moveInDate": "2025-09-15"
}
```

#### Success Response (200):
```json
{
  "success": true,
  "message": "Document package generated for John Smith",
  "documents": {
    "welcomeLetter": {
      "title": "Welcome Letter - John Smith",
      "content": "Welcome to Forward Horizon...",
      "generated": "2025-08-30T14:00:00.000Z"
    },
    "housingAgreement": {
      "title": "Housing Agreement - John Smith",
      "content": "Housing agreement prepared...",
      "generated": "2025-08-30T14:00:00.000Z"
    },
    "intakeChecklist": {
      "title": "Intake Checklist - John Smith",
      "content": "Complete intake checklist...",
      "generated": "2025-08-30T14:00:00.000Z"
    }
  },
  "emailStatus": {
    "confirmation": true,
    "admin": true
  }
}
```

---

## 📝 Form Submission

### 3. Contact Form Handler (`/api/submit-form`)
**Method**: POST  
**Description**: Process contact form submissions with email notifications  
**Features**: Validation, dual email notifications, professional templates

#### Request Body:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "(555) 123-4567",
  "service": "Veteran Housing",
  "message": "I need housing assistance",
  "consent": true
}
```

#### Success Response (200):
```json
{
  "success": true,
  "message": "Thank you! We will contact you within 24 hours.",
  "received": true,
  "submission": {
    "name": "John Doe",
    "service": "Veteran Housing",
    "timestamp": "2025-08-30T14:12:30.398Z"
  },
  "emailStatus": {
    "confirmation": true,
    "admin": true
  }
}
```

#### Validation Errors (400):
```json
{
  "success": false,
  "error": "Missing required fields",
  "required": ["firstName", "lastName", "email", "message"]
}
```

---

## 🤖 Automation Systems

### 4. Advanced Automation (`/api/automation`)
**Method**: GET/POST  
**Description**: Manage volunteers, crisis response, bed availability, social media  
**Query Parameters**: `?system={type}&action={action}`

#### Available Systems:

##### A. Volunteer Management
```bash
# Register volunteer
GET /api/automation?system=volunteers&action=register

# List volunteers
GET /api/automation?system=volunteers&action=list
```

Response:
```json
{
  "success": true,
  "system": "Volunteer Management",
  "volunteers": {
    "total": 47,
    "active": 38,
    "thisMonth": 12
  }
}
```

##### B. Crisis Response
```bash
# Report incident
GET /api/automation?system=crisis&action=report

# Get response team
GET /api/automation?system=crisis&action=respond
```

Response:
```json
{
  "success": true,
  "system": "Crisis Response",
  "status": "Monitoring",
  "response": {
    "team": "Alpha Team on standby",
    "protocol": "Standard response ready"
  }
}
```

##### C. Bed Management
```bash
# Check availability
GET /api/automation?system=beds&action=check
```

Response:
```json
{
  "success": true,
  "system": "Bed Management",
  "beds": {
    "total": 48,
    "occupied": 41,
    "available": 7,
    "occupancyRate": "85.4%"
  }
}
```

##### D. Social Media Analytics
```bash
# Get analytics
GET /api/automation?system=social&action=analytics
```

Response:
```json
{
  "success": true,
  "system": "Social Media",
  "analytics": {
    "posts": 28,
    "engagement": "3.2K interactions",
    "reach": "45.6K people"
  }
}
```

---

## 🚨 Error Handling

All APIs use consistent error responses:

### 400 Bad Request
```json
{
  "success": false,
  "error": "Specific error message",
  "details": "Additional context"
}
```

### 405 Method Not Allowed
```json
{
  "error": "Method not allowed"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "Please try again or call (310) 488-5280"
}
```

---

## 🔄 CORS Configuration

All endpoints support CORS with:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: POST, GET, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

---

## 📊 Rate Limits

Current limits (subject to change):
- **Email APIs**: 100 requests/minute
- **Document Generation**: 50 requests/minute
- **Form Submission**: 30 requests/minute
- **Automation**: 100 requests/minute

---

## 🔐 Security

### Current Implementation:
- ✅ Input validation on all endpoints
- ✅ Email format validation
- ✅ XSS protection in HTML generation
- ✅ Error message sanitization

### Coming Soon:
- API key authentication
- Rate limiting per API key
- Request signing
- Webhook verification

---

## 💡 Examples

### Complete Form Submission Flow
```javascript
// Submit contact form
const response = await fetch('https://your-domain.vercel.app/api/submit-form', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    phone: '(555) 987-6543',
    service: 'Recovery Housing',
    message: 'I need sober living support',
    consent: true
  })
});

const result = await response.json();
if (result.success) {
  console.log('Form submitted successfully!');
  console.log('Confirmation email sent:', result.emailStatus.confirmation);
  console.log('Admin notified:', result.emailStatus.admin);
}
```

### Document Generation with Email
```javascript
// Generate documents for new resident
const response = await fetch('https://your-domain.vercel.app/api/documents', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Robert Johnson',
    email: 'robert@example.com',
    phone: '(555) 246-8135',
    moveInDate: '2025-09-01'
  })
});

const result = await response.json();
console.log('Documents generated:', Object.keys(result.documents));
console.log('Email sent:', result.emailStatus);
```

---

## 📱 Mobile App Integration

All APIs are mobile-friendly with:
- JSON responses
- Low latency
- Minimal payload sizes
- CORS enabled
- No authentication required (currently)

### React Native Example:
```javascript
import axios from 'axios';

const API_BASE = 'https://your-domain.vercel.app';

// Email service
export const sendEmail = async (emailData) => {
  return axios.post(`${API_BASE}/api/email-free`, emailData);
};

// Form submission
export const submitForm = async (formData) => {
  return axios.post(`${API_BASE}/api/submit-form`, formData);
};

// Check bed availability
export const checkBeds = async () => {
  return axios.get(`${API_BASE}/api/automation?system=beds&action=check`);
};
```

---

## 🛠️ Testing

### Using cURL:
```bash
# Test email API
curl -X POST https://your-domain.vercel.app/api/email-free \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"Test","body":"Test email"}'

# Test document generation
curl -X POST https://your-domain.vercel.app/api/documents \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com"}'

# Test form submission
curl -X POST https://your-domain.vercel.app/api/submit-form \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","message":"Test message"}'

# Check bed availability
curl https://your-domain.vercel.app/api/automation?system=beds&action=check
```

### Using Postman:
1. Import this collection: [Download Postman Collection](#)
2. Set base URL to your domain
3. Run test suite

---

## 📞 Support

### API Issues:
- **Email**: dev@theforwardhorizon.com
- **Phone**: (310) 488-5280
- **GitHub**: [Report Issue](https://github.com/forward-horizon/api/issues)

### Response Times:
- Critical issues: < 1 hour
- Normal issues: < 24 hours
- Feature requests: 48-72 hours

---

## 🚀 Deployment

APIs are deployed on Vercel with:
- Automatic scaling
- Global CDN
- 99.9% uptime SLA
- Automatic SSL/TLS
- DDoS protection

### Environments:
- **Production**: `https://forward-horizon-clean.vercel.app`
- **Staging**: Coming soon
- **Development**: Local only

---

## 📈 Monitoring

### Health Check Endpoint:
```bash
GET /api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-08-30T14:00:00.000Z",
  "services": {
    "email": "operational",
    "documents": "operational",
    "automation": "operational"
  }
}
```

---

## 🔄 Changelog

### v1.2.0 (Current)
- ✅ Web3Forms integration (FREE email sending!)
- ✅ Parallel email sending for better performance
- ✅ Enhanced error logging
- ✅ Comprehensive documentation

### v1.1.0
- Added document generation API
- Form submission handler
- Email templates

### v1.0.0
- Initial API release
- Basic automation systems

---

## 🎯 Roadmap

### Q3 2025:
- [ ] API key authentication
- [ ] Webhook support
- [ ] Database integration
- [ ] File upload support

### Q4 2025:
- [ ] GraphQL endpoint
- [ ] WebSocket support
- [ ] Real-time notifications
- [ ] Advanced analytics

---

## 📝 License

© 2025 Forward Horizon Transitional Housing. All rights reserved.

---

**Last Updated**: August 30, 2025  
**API Version**: 1.2.0  
**Status**: ✅ All Systems Operational