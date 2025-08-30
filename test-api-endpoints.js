#!/usr/bin/env node

/**
 * Comprehensive API Endpoint Testing Suite for Forward Horizon
 * Tests all main API endpoints to identify working functionality and issues
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const TIMEOUT = 10000; // 10 seconds

// Test results storage
let testResults = [];
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m',   // Red
    warning: '\x1b[33m', // Yellow
    reset: '\x1b[0m'     // Reset
  };
  
  console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
}

function recordTest(endpoint, testName, success, details) {
  totalTests++;
  if (success) {
    passedTests++;
    log(`✅ ${endpoint} - ${testName}`, 'success');
  } else {
    failedTests++;
    log(`❌ ${endpoint} - ${testName}`, 'error');
  }
  
  testResults.push({
    endpoint,
    testName,
    success,
    details,
    timestamp: new Date().toISOString()
  });
}

// API testing functions
async function makeRequest(url, method = 'GET', body = null, headers = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...headers
  };

  const options = {
    method,
    headers: defaultHeaders,
    signal: AbortSignal.timeout(TIMEOUT)
  };

  if (body && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const responseText = await response.text();
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { rawResponse: responseText };
    }

    return {
      status: response.status,
      statusText: response.statusText,
      data: responseData,
      headers: Object.fromEntries(response.headers.entries())
    };
  } catch (error) {
    return {
      status: 0,
      statusText: 'Network Error',
      data: { error: error.message },
      headers: {}
    };
  }
}

// Test 1: Documents API (/api/documents)
async function testDocumentsAPI() {
  log('🔍 Testing Documents API (/api/documents)', 'info');
  
  // Test 1a: Valid document generation request
  const validData = {
    name: 'Test Veteran',
    email: 'test@example.com',
    phone: '(555) 123-4567',
    moveInDate: '2025-03-15'
  };

  const validResponse = await makeRequest(`${BASE_URL}/api/documents`, 'POST', validData);
  recordTest('/api/documents', 'Valid document generation', 
    validResponse.status === 200 && validResponse.data.success,
    { request: validData, response: validResponse });

  // Test 1b: Missing required fields
  const invalidData = {
    phone: '(555) 123-4567'
    // missing name and email
  };

  const invalidResponse = await makeRequest(`${BASE_URL}/api/documents`, 'POST', invalidData);
  recordTest('/api/documents', 'Handles missing required fields', 
    invalidResponse.status === 400 && !invalidResponse.data.success,
    { request: invalidData, response: invalidResponse });

  // Test 1c: Invalid email format
  const badEmailData = {
    name: 'Test User',
    email: 'invalid-email-format',
    phone: '(555) 123-4567'
  };

  const badEmailResponse = await makeRequest(`${BASE_URL}/api/documents`, 'POST', badEmailData);
  recordTest('/api/documents', 'Validates email format', 
    badEmailResponse.status === 400 && !badEmailResponse.data.success,
    { request: badEmailData, response: badEmailResponse });

  // Test 1d: GET method (should be rejected)
  const getResponse = await makeRequest(`${BASE_URL}/api/documents`, 'GET');
  recordTest('/api/documents', 'Rejects GET requests', 
    getResponse.status === 405,
    { response: getResponse });
}

// Test 2: Email Free API (/api/email-free)
async function testEmailFreeAPI() {
  log('🔍 Testing Free Email API (/api/email-free)', 'info');
  
  // Test 2a: Valid email request
  const validEmailData = {
    to: 'test@example.com',
    subject: 'Test Email from Forward Horizon',
    body: 'This is a test email to verify the free email service is working.',
    html: '<h1>Test Email</h1><p>This is a test email to verify the free email service is working.</p>'
  };

  const validEmailResponse = await makeRequest(`${BASE_URL}/api/email-free`, 'POST', validEmailData);
  recordTest('/api/email-free', 'Handles valid email request', 
    validEmailResponse.status === 200,
    { request: validEmailData, response: validEmailResponse });

  // Test 2b: Missing required fields
  const incompleteEmailData = {
    to: 'test@example.com'
    // missing subject and body
  };

  const incompleteResponse = await makeRequest(`${BASE_URL}/api/email-free`, 'POST', incompleteEmailData);
  recordTest('/api/email-free', 'Handles missing required fields', 
    incompleteResponse.status === 400,
    { request: incompleteEmailData, response: incompleteResponse });

  // Test 2c: Service configuration check
  const configCheckResponse = validEmailResponse;
  const hasEmailService = configCheckResponse.data.success || 
                         (configCheckResponse.data.freeOptions !== undefined);
  recordTest('/api/email-free', 'Email service configuration', 
    hasEmailService,
    { details: 'Checks if email service is configured or provides setup instructions' });
}

// Test 3: Automation API (/api/automation)
async function testAutomationAPI() {
  log('🔍 Testing Automation API (/api/automation)', 'info');
  
  // Test 3a: Help endpoint
  const helpResponse = await makeRequest(`${BASE_URL}/api/automation?system=help`, 'GET');
  recordTest('/api/automation', 'Help documentation', 
    helpResponse.status === 200 && helpResponse.data.availableSystems,
    { response: helpResponse });

  // Test 3b: Volunteer system - registration
  const volunteerData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    skills: ['Counseling', 'Event Planning'],
    availability: 'Weekends'
  };

  const volunteerResponse = await makeRequest(`${BASE_URL}/api/automation?system=volunteers&action=register`, 'POST', volunteerData);
  recordTest('/api/automation', 'Volunteer registration', 
    volunteerResponse.status === 200 && volunteerResponse.data.success,
    { request: volunteerData, response: volunteerResponse });

  // Test 3c: Volunteer system - list
  const volunteerListResponse = await makeRequest(`${BASE_URL}/api/automation?system=volunteers&action=list`, 'GET');
  recordTest('/api/automation', 'Volunteer list', 
    volunteerListResponse.status === 200 && volunteerListResponse.data.volunteers,
    { response: volunteerListResponse });

  // Test 3d: Crisis system - report
  const crisisData = {
    reporterName: 'Staff Member',
    residentName: 'Test Resident',
    incidentType: 'behavioral',
    severity: 'medium',
    description: 'Test incident report for API testing'
  };

  const crisisResponse = await makeRequest(`${BASE_URL}/api/automation?system=crisis&action=report`, 'POST', crisisData);
  recordTest('/api/automation', 'Crisis report', 
    crisisResponse.status === 200 && crisisResponse.data.success,
    { request: crisisData, response: crisisResponse });

  // Test 3e: Beds system - availability
  const bedsResponse = await makeRequest(`${BASE_URL}/api/automation?system=beds&action=availability`, 'GET');
  recordTest('/api/automation', 'Bed availability', 
    bedsResponse.status === 200 && bedsResponse.data.facility,
    { response: bedsResponse });

  // Test 3f: Social media system - analytics
  const socialResponse = await makeRequest(`${BASE_URL}/api/automation?system=social&action=analytics`, 'GET');
  recordTest('/api/automation', 'Social media analytics', 
    socialResponse.status === 200 && socialResponse.data.performance,
    { response: socialResponse });
}

// Test 4: Send Email API (/api/send-email)
async function testSendEmailAPI() {
  log('🔍 Testing Send Email API (/api/send-email)', 'info');
  
  // Test 4a: Valid email send request
  const emailData = {
    to: 'test@example.com',
    subject: 'Test Email via Send Email API',
    body: 'This is a test email to verify the send-email endpoint.',
    html: '<h2>Test Email</h2><p>This is a test email to verify the send-email endpoint.</p>',
    from: 'noreply@theforwardhorizon.com'
  };

  const emailResponse = await makeRequest(`${BASE_URL}/api/send-email`, 'POST', emailData);
  recordTest('/api/send-email', 'Email send functionality', 
    emailResponse.status === 200,
    { request: emailData, response: emailResponse });

  // Test 4b: Missing required fields
  const incompleteData = {
    to: 'test@example.com'
    // missing subject and body
  };

  const incompleteEmailResponse = await makeRequest(`${BASE_URL}/api/send-email`, 'POST', incompleteData);
  recordTest('/api/send-email', 'Handles missing fields', 
    incompleteEmailResponse.status === 400,
    { request: incompleteData, response: incompleteEmailResponse });

  // Test 4c: Integration options provided
  const integrationCheck = emailResponse.data.integration || emailResponse.data.setup;
  recordTest('/api/send-email', 'Provides integration guidance', 
    integrationCheck !== undefined,
    { details: 'Checks if endpoint provides email service integration instructions' });
}

// Test 5: Gmail Email API (/api/email-gmail)
async function testGmailEmailAPI() {
  log('🔍 Testing Gmail Email API (/api/email-gmail)', 'info');
  
  // Test 5a: Gmail configuration check
  const gmailData = {
    to: 'test@example.com',
    subject: 'Test Gmail Integration',
    body: 'Testing Gmail email integration endpoint.'
  };

  const gmailResponse = await makeRequest(`${BASE_URL}/api/email-gmail`, 'POST', gmailData);
  recordTest('/api/email-gmail', 'Gmail integration endpoint', 
    gmailResponse.status === 200,
    { request: gmailData, response: gmailResponse });

  // Test 5b: Configuration guidance
  const hasSetupInstructions = gmailResponse.data.setup || gmailResponse.data.troubleshooting;
  recordTest('/api/email-gmail', 'Provides Gmail setup instructions', 
    hasSetupInstructions !== undefined,
    { details: 'Checks if endpoint provides Gmail configuration guidance' });

  // Test 5c: Missing fields handling
  const incompleteGmailData = {
    subject: 'Test'
    // missing to and body
  };

  const incompleteGmailResponse = await makeRequest(`${BASE_URL}/api/email-gmail`, 'POST', incompleteGmailData);
  recordTest('/api/email-gmail', 'Handles missing required fields', 
    incompleteGmailResponse.status === 400,
    { request: incompleteGmailData, response: incompleteGmailResponse });
}

// Generate comprehensive test report
function generateReport() {
  log('📊 Generating Test Report', 'info');
  
  const report = {
    testSummary: {
      totalTests,
      passedTests,
      failedTests,
      successRate: ((passedTests / totalTests) * 100).toFixed(2) + '%',
      testDate: new Date().toISOString()
    },
    endpointStatus: {
      '/api/documents': {
        status: testResults.filter(r => r.endpoint === '/api/documents' && r.success).length > 0 ? 'Working' : 'Issues Found',
        tests: testResults.filter(r => r.endpoint === '/api/documents').length
      },
      '/api/email-free': {
        status: testResults.filter(r => r.endpoint === '/api/email-free' && r.success).length > 0 ? 'Working' : 'Issues Found',
        tests: testResults.filter(r => r.endpoint === '/api/email-free').length
      },
      '/api/automation': {
        status: testResults.filter(r => r.endpoint === '/api/automation' && r.success).length > 0 ? 'Working' : 'Issues Found',
        tests: testResults.filter(r => r.endpoint === '/api/automation').length
      },
      '/api/send-email': {
        status: testResults.filter(r => r.endpoint === '/api/send-email' && r.success).length > 0 ? 'Working' : 'Issues Found',
        tests: testResults.filter(r => r.endpoint === '/api/send-email').length
      },
      '/api/email-gmail': {
        status: testResults.filter(r => r.endpoint === '/api/email-gmail' && r.success).length > 0 ? 'Working' : 'Issues Found',
        tests: testResults.filter(r => r.endpoint === '/api/email-gmail').length
      }
    },
    failedTests: testResults.filter(r => !r.success),
    recommendations: generateRecommendations(),
    fullResults: testResults
  };

  return report;
}

function generateRecommendations() {
  const recommendations = [];
  const failedTests = testResults.filter(r => !r.success);
  
  // Check for network/connectivity issues
  const networkErrors = failedTests.filter(r => 
    r.details.response && r.details.response.status === 0
  );
  
  if (networkErrors.length > 0) {
    recommendations.push({
      priority: 'HIGH',
      issue: 'Network Connectivity',
      description: 'Some endpoints are not reachable. Server may not be running.',
      action: 'Ensure the development server is running or check the deployed URL'
    });
  }

  // Check for email service configuration
  const emailTests = testResults.filter(r => 
    r.endpoint.includes('email') && r.details.response && 
    r.details.response.data && 
    (r.details.response.data.freeOptions || r.details.response.data.setup)
  );
  
  if (emailTests.length > 0) {
    recommendations.push({
      priority: 'MEDIUM',
      issue: 'Email Service Configuration',
      description: 'Email endpoints are working but require service provider setup',
      action: 'Configure email service providers (Resend, SendGrid, or Gmail) using environment variables'
    });
  }

  // Check for validation errors
  const validationErrors = failedTests.filter(r => 
    r.details.response && r.details.response.status === 400
  );
  
  if (validationErrors.length === 0) {
    recommendations.push({
      priority: 'LOW',
      issue: 'Input Validation',
      description: 'All endpoints properly validate input data',
      action: 'No action needed - validation is working correctly'
    });
  }

  return recommendations;
}

// Main test runner
async function runAllTests() {
  log('🚀 Starting Forward Horizon API Endpoint Testing', 'info');
  log(`Base URL: ${BASE_URL}`, 'info');
  log('═'.repeat(80), 'info');

  try {
    await testDocumentsAPI();
    await testEmailFreeAPI();
    await testAutomationAPI();
    await testSendEmailAPI();
    await testGmailEmailAPI();

    log('═'.repeat(80), 'info');
    
    const report = generateReport();
    
    // Display summary
    log(`📈 Test Summary: ${passedTests}/${totalTests} tests passed (${report.testSummary.successRate})`, 
        passedTests === totalTests ? 'success' : 'warning');
    
    // Display endpoint status
    log('\n🔗 Endpoint Status:', 'info');
    for (const [endpoint, status] of Object.entries(report.endpointStatus)) {
      const statusColor = status.status === 'Working' ? 'success' : 'warning';
      log(`  ${endpoint}: ${status.status} (${status.tests} tests)`, statusColor);
    }

    // Display recommendations
    if (report.recommendations.length > 0) {
      log('\n💡 Recommendations:', 'info');
      report.recommendations.forEach(rec => {
        const priorityColor = rec.priority === 'HIGH' ? 'error' : rec.priority === 'MEDIUM' ? 'warning' : 'info';
        log(`  [${rec.priority}] ${rec.issue}: ${rec.description}`, priorityColor);
        log(`    Action: ${rec.action}`, 'info');
      });
    }

    // Save detailed report
    const reportPath = join(__dirname, 'api-test-report.json');
    await import('fs').then(fs => 
      fs.promises.writeFile(reportPath, JSON.stringify(report, null, 2))
    );
    log(`\n📄 Detailed report saved to: ${reportPath}`, 'info');

    return report;

  } catch (error) {
    log(`❌ Test suite failed: ${error.message}`, 'error');
    return null;
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests()
    .then(report => {
      if (report) {
        process.exit(report.failedTests.length > 0 ? 1 : 0);
      } else {
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Test runner failed:', error);
      process.exit(1);
    });
}

export default runAllTests;