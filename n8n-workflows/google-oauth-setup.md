# Google Drive OAuth Setup for N8N

## Step-by-Step Guide to Get Client ID & Secret

### Step 1: Go to Google Cloud Console
1. Visit: **https://console.cloud.google.com**
2. Sign in with your **theforwardhorizon@gmail.com** account

### Step 2: Create or Select Project
1. Click the **project dropdown** (top left)
2. Click **"New Project"** or select existing project
3. Name it: **"Forward Horizon N8N"**
4. Click **"Create"**

### Step 3: Enable Google Drive API
1. In the left sidebar, click **"APIs & Services"** → **"Library"**
2. Search for: **"Google Drive API"**
3. Click on it and click **"Enable"**
4. Also enable: **"Google Docs API"** and **"Gmail API"**

### Step 4: Create OAuth Credentials
1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ Create Credentials"** → **"OAuth client ID"**
3. If prompted, configure OAuth consent screen first:
   - Choose **"External"** user type
   - Fill in app name: **"Forward Horizon Document System"**
   - Add your email as developer contact
   - Save and continue through steps

### Step 5: Configure OAuth Client
1. Choose **"Web application"**
2. Name: **"N8N Forward Horizon Integration"**
3. **Authorized redirect URIs:** Add this EXACT URL:
   ```
   https://oauth.n8n.cloud/oauth2/callback
   ```
4. Click **"Create"**

### Step 6: Get Your Credentials
You'll see a popup with:
- **Client ID** (long string starting with numbers)
- **Client Secret** (shorter string with letters/numbers)

**Copy both** - you'll paste them into N8N!

### Step 7: Back to N8N
1. Paste **Client ID** into N8N
2. Paste **Client Secret** into N8N  
3. Click **"Connect my account"**
4. Sign in with Google and authorize

## Common Issues & Solutions:

### "OAuth consent screen required"
- Go back to Google Cloud Console
- **APIs & Services** → **OAuth consent screen**
- Fill in required fields and save

### "API not enabled"
Make sure you enabled:
- ✅ Google Drive API
- ✅ Google Docs API  
- ✅ Gmail API

### "Redirect URI mismatch"
- Double-check the redirect URL is exactly:
  `https://oauth.n8n.cloud/oauth2/callback`
- No extra spaces or characters

### "Access denied" 
- Make sure you're signed in with the same Google account
- Check that APIs are enabled for the correct project

## Pro Tips:
- **Keep credentials secure** - don't share Client Secret
- **Use same project** for all Google APIs (Drive, Docs, Gmail)
- **Test connection** before continuing with workflow setup

## Quick Links:
- **Google Cloud Console**: https://console.cloud.google.com
- **OAuth Setup Guide**: https://developers.google.com/identity/protocols/oauth2

Once you have Client ID and Secret, the connection should work smoothly!