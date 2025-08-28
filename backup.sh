#!/bin/bash

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
for file in "${FILES[@]}"; do
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