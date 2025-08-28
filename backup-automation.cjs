#!/usr/bin/env node

/**
 * Automated backup setup for Forward Horizon website
 * Creates local and remote backup solutions
 */

const fs = require('fs');
const path = require('path');

// Backup script for critical files
const backupScript = `#!/bin/bash

# Forward Horizon Automated Backup Script
# Run daily via cron: 0 2 * * * /path/to/backup.sh

DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="backups"
TEMP_DIR="/tmp/forward_horizon_backup_$DATE"

echo "🔄 Starting Forward Horizon backup - $DATE"

# Create backup directory
mkdir -p "$BACKUP_DIR"
mkdir -p "$TEMP_DIR"

# Critical files to backup
FILES=(
    "api/submit-form.js"
    "index.html"
    "application.html"
    "application-success.html"
    "faq.html"
    "get-involved.html"
    "vercel.json"
    "package.json"
    "resources/"
    ".env"
)

# Copy files to temp directory
echo "📁 Copying critical files..."
for file in "\${FILES[@]}"; do
    if [ -e "$file" ]; then
        cp -r "$file" "$TEMP_DIR/" 2>/dev/null || echo "⚠️  Could not backup $file"
    fi
done

# Create tar.gz archive
echo "📦 Creating archive..."
cd "$TEMP_DIR/.." && tar -czf "forward_horizon_backup_$DATE.tar.gz" "forward_horizon_backup_$DATE"

# Move to backup directory
mv "forward_horizon_backup_$DATE.tar.gz" "$OLDPWD/$BACKUP_DIR/"

# Cleanup temp directory
rm -rf "$TEMP_DIR"

# Keep only last 30 days of backups
echo "🧹 Cleaning old backups..."
find "$BACKUP_DIR" -name "forward_horizon_backup_*.tar.gz" -mtime +30 -delete

echo "✅ Backup completed: $BACKUP_DIR/forward_horizon_backup_$DATE.tar.gz"

# Optional: Upload to cloud storage (uncomment if needed)
# gsutil cp "$BACKUP_DIR/forward_horizon_backup_$DATE.tar.gz" gs://your-backup-bucket/
# aws s3 cp "$BACKUP_DIR/forward_horizon_backup_$DATE.tar.gz" s3://your-backup-bucket/

echo "🎯 Backup process finished"
`;

// GitHub Actions workflow for automated backups
const githubWorkflow = `name: Automated Backups

on:
  schedule:
    # Run daily at 2 AM UTC
    - cron: '0 2 * * *'
  workflow_dispatch:

jobs:
  backup:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout repository
      uses: actions/checkout@v4
      
    - name: Create backup
      run: |
        DATE=$(date +"%Y%m%d_%H%M%S")
        mkdir -p backups
        
        # Create backup archive
        tar -czf "backups/forward_horizon_$DATE.tar.gz" \\
          --exclude='node_modules' \\
          --exclude='.git' \\
          --exclude='backups' \\
          .
          
        echo "Backup created: forward_horizon_$DATE.tar.gz"
        
    - name: Upload backup artifacts
      uses: actions/upload-artifact@v4
      with:
        name: backup-${{ github.run_number }}
        path: backups/
        retention-days: 90

    - name: Commit backup info
      run: |
        git config --local user.email "action@github.com"
        git config --local user.name "GitHub Action"
        echo "Last backup: $(date)" > LAST_BACKUP.txt
        git add LAST_BACKUP.txt
        git commit -m "Update backup timestamp" || exit 0
        git push
`;

// Environment variable backup template
const envTemplate = `# Forward Horizon Environment Variables Backup Template
# Copy this to .env and fill in your actual values

# N8N Integration
N8N_WEBHOOK_URL=https://your-n8n.cloud/webhook/forward-horizon

# Email Configuration (if using direct email)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Google Analytics (optional)
GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Backup Configuration
BACKUP_ENABLED=true
BACKUP_RETENTION_DAYS=30

# Security
ALLOWED_ORIGINS=https://theforwardhorizon.com,https://forward-horizon-clean.vercel.app
`;

console.log('🔒 Setting up automated backup system...\n');

// Create backup directory
if (!fs.existsSync('backups')) {
  fs.mkdirSync('backups');
  console.log('✅ Created backups directory');
}

// Create backup script
fs.writeFileSync('backup.sh', backupScript);
fs.chmodSync('backup.sh', '755');
console.log('✅ Created backup.sh script');

// Create GitHub Actions workflow directory and file
if (!fs.existsSync('.github')) {
  fs.mkdirSync('.github');
}
if (!fs.existsSync('.github/workflows')) {
  fs.mkdirSync('.github/workflows');
}
fs.writeFileSync('.github/workflows/backup.yml', githubWorkflow);
console.log('✅ Created GitHub Actions backup workflow');

// Create environment template
fs.writeFileSync('.env.template', envTemplate);
console.log('✅ Created environment template');

// Create .gitignore additions for backup files
const gitignoreAdditions = `
# Backup files
backups/
*.tar.gz
.env
LAST_BACKUP.txt
`;

let gitignore = '';
if (fs.existsSync('.gitignore')) {
  gitignore = fs.readFileSync('.gitignore', 'utf8');
}

if (!gitignore.includes('backups/')) {
  fs.writeFileSync('.gitignore', gitignore + gitignoreAdditions);
  console.log('✅ Updated .gitignore for backup files');
}

console.log('\n🎯 Backup system setup complete!');
console.log('\n📋 Manual backup options:');
console.log('• Run: ./backup.sh (creates local backup)');
console.log('• GitHub Actions will run daily automatically');
console.log('• Backups kept for 30 days locally, 90 days on GitHub');

console.log('\n🔧 Setup instructions:');
console.log('1. Copy .env.template to .env and fill in values');
console.log('2. Commit and push to enable GitHub Actions backups');
console.log('3. Optional: Set up cron job for local backups');
console.log('   Example: 0 2 * * * /path/to/your/project/backup.sh');

console.log('\n🚨 Important files to backup regularly:');
console.log('• N8N workflow exports');
console.log('• Google Analytics configuration');
console.log('• Vercel environment variables');
console.log('• Any custom integrations or API keys');