#!/usr/bin/env node

/**
 * Test the document generation system
 */

import ForwardHorizonDocuments from './document-generator.js';

const documentGenerator = new ForwardHorizonDocuments();

// Test veteran data
const testVeteran = {
  name: "John Smith",
  email: "john.smith@example.com", 
  phone: "(555) 123-4567",
  moveInDate: "February 15, 2025",
  roomNumber: "Room 12A",
  caseManager: "Sarah Johnson",
  emergencyContact: "Jane Smith - (555) 987-6543",
  monthlyRent: "0"
};

console.log('🧪 Testing Forward Horizon Document Generator...\n');

async function runTests() {
  try {
    // Test document generation
    console.log('📋 Generating document package...');
    const result = await documentGenerator.generateDocumentPackage(testVeteran);
    
    console.log('✅ Documents generated successfully!');
    console.log('📁 Files created:');
    result.filesGenerated.forEach(file => {
      console.log(`   - ${file}`);
    });
    
    console.log('\n📧 Email data prepared:');
    console.log(`   To: ${result.emailData.to}`);
    console.log(`   Subject: ${result.emailData.subject}`);
    
    console.log('\n🎉 Test completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Check the generated HTML files in the documents folder');
    console.log('2. Open them in a browser to see how they look');
    console.log('3. Integrate with your email system to send automatically');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

runTests();