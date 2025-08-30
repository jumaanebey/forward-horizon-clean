#!/usr/bin/env node

/**
 * Direct API Endpoint Testing for Forward Horizon
 * Tests endpoints directly by importing and calling their handler functions
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test results storage
let testResults = [];
let totalTests = 0;
let passedTests = 0;

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',    
    success: '\x1b[32m', 
    error: '\x1b[31m',   
    warning: '\x1b[33m', 
    reset: '\x1b[0m'     
  };
  
  console.log(`${colors[type]}${message}${colors.reset}`);
}

function recordTest(endpoint, testName, success, details) {
  totalTests++;
  if (success) {
    passedTests++;
    log(`✅ ${endpoint} - ${testName}`, 'success');
  } else {
    log(`❌ ${endpoint} - ${testName}: ${details}`, 'error');
  }
  
  testResults.push({
    endpoint,
    testName,
    success,
    details,
    timestamp: new Date().toISOString()
  });
}

// Mock request/response objects for serverless testing
function createMockReq(method = 'GET', body = null, query = {}) {
  return {
    method,
    body,
    query,
    headers: {
      host: 'localhost:3000',
      'content-type': 'application/json'
    }
  };
}

function createMockRes() {
  let statusCode = 200;
  let headers = {};
  let responseData = null;

  return {
    status: (code) => {
      statusCode = code;
      return {
        json: (data) => {
          responseData = data;
          return { status: statusCode, data: responseData };
        },
        end: () => {
          return { status: statusCode, data: null };
        }
      };
    },
    setHeader: (key, value) => {
      headers[key] = value;
    },
    json: (data) => {
      responseData = data;
      return { status: statusCode, data: responseData };
    },
    headers,
    statusCode,
    responseData
  };
}

// Test individual endpoints by importing and calling them
async function testEndpointDirect(handlerPath, testCases) {
  try {
    const { default: handler } = await import(handlerPath);
    const endpointName = handlerPath.split('/').pop().replace('.js', '');
    
    log(`🔍 Testing ${endpointName} endpoint directly`, 'info');
    
    for (const testCase of testCases) {
      try {
        const req = createMockReq(testCase.method, testCase.body, testCase.query);
        const res = createMockRes();
        
        const result = await handler(req, res);
        
        const success = testCase.expectedStatus ? 
          result.status === testCase.expectedStatus : 
          result.status >= 200 && result.status < 400;
        
        recordTest(`/api/${endpointName}`, testCase.name, success, 
          success ? 'Passed' : `Expected status ${testCase.expectedStatus}, got ${result.status}`);
        
        if (!success) {
          log(`   Response: ${JSON.stringify(result.data)}`, 'warning');
        }
      } catch (error) {
        recordTest(`/api/${endpointName}`, testCase.name, false, error.message);
      }
    }
    
  } catch (error) {
    log(`❌ Failed to load handler ${handlerPath}: ${error.message}`, 'error');
  }
}

// Test cases for each endpoint
const testCases = {
  '/api/documents.js': [
    {
      name: 'Valid document generation',
      method: 'POST',
      body: {
        name: 'Test Veteran',
        email: 'test@example.com',
        phone: '(555) 123-4567',
        moveInDate: '2025-03-15'
      },
      expectedStatus: 200
    },
    {
      name: 'Missing required fields',
      method: 'POST',
      body: {
        phone: '(555) 123-4567'
      },
      expectedStatus: 400
    },
    {
      name: 'Invalid email format',
      method: 'POST',
      body: {
        name: 'Test User',
        email: 'invalid-email',
        phone: '(555) 123-4567'
      },
      expectedStatus: 400
    },
    {
      name: 'GET method rejection',
      method: 'GET',
      body: null,
      expectedStatus: 405
    }
  ],
  '/api/email-free.js': [
    {
      name: 'Valid email request',
      method: 'POST',
      body: {
        to: 'test@example.com',
        subject: 'Test Subject',
        body: 'Test body content'
      },
      expectedStatus: 200
    },
    {
      name: 'Missing required fields',
      method: 'POST',
      body: {
        to: 'test@example.com'
      },
      expectedStatus: 400
    }
  ],
  '/api/automation.js': [
    {
      name: 'Help documentation',
      method: 'GET',
      query: { system: 'help' },
      expectedStatus: 200
    },
    {
      name: 'Volunteer registration',
      method: 'POST',
      query: { system: 'volunteers', action: 'register' },
      body: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      },
      expectedStatus: 200
    },
    {
      name: 'Volunteer list',
      method: 'GET',
      query: { system: 'volunteers', action: 'list' },
      expectedStatus: 200
    },
    {
      name: 'Crisis report',
      method: 'POST',
      query: { system: 'crisis', action: 'report' },
      body: {
        reporterName: 'Staff',
        residentName: 'Test',
        incidentType: 'behavioral',
        severity: 'medium'
      },
      expectedStatus: 200
    },
    {
      name: 'Bed availability',
      method: 'GET',
      query: { system: 'beds', action: 'availability' },
      expectedStatus: 200
    },
    {
      name: 'Social analytics',
      method: 'GET',
      query: { system: 'social', action: 'analytics' },
      expectedStatus: 200
    }
  ],
  '/api/send-email.js': [
    {
      name: 'Valid email send',
      method: 'POST',
      body: {
        to: 'test@example.com',
        subject: 'Test Email',
        body: 'Test content'
      },
      expectedStatus: 200
    },
    {
      name: 'Missing required fields',
      method: 'POST',
      body: {
        to: 'test@example.com'
      },
      expectedStatus: 400
    }
  ],
  '/api/email-gmail.js': [
    {
      name: 'Gmail endpoint test',
      method: 'POST',
      body: {
        to: 'test@example.com',
        subject: 'Test Gmail',
        body: 'Test content'
      },
      expectedStatus: 200
    },
    {
      name: 'Missing required fields',
      method: 'POST',
      body: {
        subject: 'Test'
      },
      expectedStatus: 400
    }
  ]
};

// Run all tests
async function runDirectTests() {
  log('🚀 Starting Direct Endpoint Testing for Forward Horizon', 'info');
  log('═'.repeat(60), 'info');

  for (const [handlerPath, cases] of Object.entries(testCases)) {
    const fullPath = join(__dirname, handlerPath);
    await testEndpointDirect(fullPath, cases);
    log(''); // spacing
  }

  log('═'.repeat(60), 'info');
  log(`📈 Test Summary: ${passedTests}/${totalTests} tests passed (${((passedTests/totalTests)*100).toFixed(2)}%)`, 
      passedTests === totalTests ? 'success' : 'warning');

  // Generate endpoint status report
  const endpointStatus = {};
  testResults.forEach(result => {
    if (!endpointStatus[result.endpoint]) {
      endpointStatus[result.endpoint] = { passed: 0, total: 0 };
    }
    endpointStatus[result.endpoint].total++;
    if (result.success) {
      endpointStatus[result.endpoint].passed++;
    }
  });

  log('\n🔗 Endpoint Status:', 'info');
  for (const [endpoint, stats] of Object.entries(endpointStatus)) {
    const status = stats.passed === stats.total ? 'Working' : 
                   stats.passed > 0 ? 'Partial' : 'Issues Found';
    const color = status === 'Working' ? 'success' : 
                  status === 'Partial' ? 'warning' : 'error';
    log(`  ${endpoint}: ${status} (${stats.passed}/${stats.total})`, color);
  }

  // Generate recommendations
  log('\n💡 Analysis:', 'info');
  
  const failedTests = testResults.filter(r => !r.success);
  if (failedTests.length === 0) {
    log('  ✅ All endpoints are functioning correctly', 'success');
  } else {
    const endpointsWithIssues = [...new Set(failedTests.map(t => t.endpoint))];
    log(`  ⚠️  ${endpointsWithIssues.length} endpoints have issues:`, 'warning');
    endpointsWithIssues.forEach(ep => {
      const issues = failedTests.filter(t => t.endpoint === ep);
      log(`    ${ep}: ${issues.length} failed tests`, 'warning');
    });
  }

  // Check for specific functionality
  const emailEndpoints = testResults.filter(r => r.endpoint.includes('email'));
  const workingEmailEndpoints = emailEndpoints.filter(r => r.success).length;
  log(`  📧 Email functionality: ${workingEmailEndpoints}/${emailEndpoints.length} email tests passed`, 'info');

  const automationTests = testResults.filter(r => r.endpoint === '/api/automation');
  const workingAutomation = automationTests.filter(r => r.success).length;
  log(`  ⚙️  Automation systems: ${workingAutomation}/${automationTests.length} automation tests passed`, 'info');

  // Save detailed report
  const report = {
    summary: {
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      successRate: ((passedTests/totalTests)*100).toFixed(2) + '%'
    },
    endpointStatus,
    failedTests: testResults.filter(r => !r.success),
    allResults: testResults,
    testDate: new Date().toISOString()
  };

  const reportPath = join(__dirname, 'direct-test-report.json');
  await import('fs').then(fs => 
    fs.promises.writeFile(reportPath, JSON.stringify(report, null, 2))
  );
  log(`\n📄 Detailed report saved to: ${reportPath}`, 'info');

  return report;
}

// Run tests
runDirectTests()
  .then(report => {
    process.exit(report.failedTests.length > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });