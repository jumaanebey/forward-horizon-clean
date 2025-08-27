#!/usr/bin/env node

/**
 * Script to add Google Analytics to all HTML files
 * Usage: node add-analytics.js G-XXXXXXXXXX
 */

const fs = require('fs');
const path = require('path');

const measurementId = process.argv[2];

if (!measurementId) {
    console.log('❌ Please provide your Google Analytics Measurement ID');
    console.log('Usage: node add-analytics.js G-XXXXXXXXXX');
    process.exit(1);
}

const analyticsCode = `
    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=${measurementId}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${measurementId}', {
        anonymize_ip: true,
        cookie_flags: 'SameSite=None;Secure'
      });
      
      // Track form submissions
      function trackFormSubmit(formType) {
        if (typeof gtag !== 'undefined') {
          gtag('event', 'form_submit', {
            'form_type': formType,
            'page_location': window.location.href
          });
        }
      }
      
      // Track page scroll depth
      let scrollTracked = false;
      window.addEventListener('scroll', function() {
        if (!scrollTracked) {
          const scrollPercent = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
          if (scrollPercent > 0.75) {
            if (typeof gtag !== 'undefined') {
              gtag('event', 'scroll', {
                'percent_scrolled': '75%'
              });
            }
            scrollTracked = true;
          }
        }
      });
    </script>
`;

// HTML files to update
const htmlFiles = [
    'index.html',
    'application.html',
    'faq.html',
    'get-involved.html'
];

let filesUpdated = 0;
let errors = 0;

htmlFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    
    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  File not found: ${file}`);
        errors++;
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if analytics already exists
    if (content.includes('googletagmanager.com/gtag')) {
        console.log(`✓ Analytics already added to ${file}`);
        return;
    }
    
    // Add analytics before closing </head> tag
    content = content.replace('</head>', `${analyticsCode}</head>`);
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Added analytics to ${file}`);
    filesUpdated++;
});

console.log('\n📊 Analytics Setup Complete!');
console.log(`Files updated: ${filesUpdated}`);
if (errors > 0) {
    console.log(`Errors: ${errors}`);
}

console.log('\n📝 Next steps:');
console.log('1. Commit changes: git add -A && git commit -m "Add Google Analytics"');
console.log('2. Push to GitHub: git push origin main');
console.log('3. Deploy to Vercel: vercel --prod');
console.log('4. Verify in Google Analytics Real-Time view');
console.log('\n🔗 View your analytics at: https://analytics.google.com');