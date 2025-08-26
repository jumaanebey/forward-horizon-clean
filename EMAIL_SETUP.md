# Email Setup Instructions

## Step 1: Create Gmail App Password

1. Go to your Google Account settings: https://myaccount.google.com/security
2. Enable 2-Step Verification if not already enabled
3. Go to App Passwords: https://myaccount.google.com/apppasswords
4. Select "Mail" and "Other (custom name)"
5. Enter "Forward Horizon Website" as the name
6. Copy the generated 16-character password (no spaces)

## Step 2: Add Environment Variables to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. Go to: https://vercel.com/jumaane-beys-projects/forward-horizon-clean/settings/environment-variables
2. Add these variables:
   - **EMAIL_USER**: Your Gmail address (e.g., forwardhorizon@gmail.com)
   - **EMAIL_PASSWORD**: The 16-character app password from Step 1
   - **CONTACT_EMAIL**: (Optional) Email for contact form submissions
   - **APPLICATION_EMAIL**: (Optional) Email for application submissions
   - **VOLUNTEER_EMAIL**: (Optional) Email for volunteer submissions

3. Select all environments (Production, Preview, Development)
4. Click "Save" for each variable

### Option B: Via CLI

```bash
vercel env add EMAIL_USER production
# Enter your Gmail address when prompted

vercel env add EMAIL_PASSWORD production
# Enter the app password when prompted

# Optionally add recipient overrides:
vercel env add CONTACT_EMAIL production
vercel env add APPLICATION_EMAIL production
vercel env add VOLUNTEER_EMAIL production
```

## Step 3: Redeploy

After adding environment variables, redeploy for changes to take effect:

```bash
vercel --prod --yes
```

## Testing

Test the contact form at: https://theforwardhorizon.com

The form will:
1. Send a notification email to the configured recipient
2. Send a confirmation email to the person who submitted the form
3. Show a success message on the website

## Troubleshooting

If emails aren't sending:
1. Check Vercel Functions logs: https://vercel.com/jumaane-beys-projects/forward-horizon-clean/functions
2. Verify app password is correct (16 characters, no spaces)
3. Check Gmail isn't blocking the connection (may need to allow "less secure apps" temporarily)
4. Make sure 2-Step Verification is enabled on the Gmail account

## Default Recipients

If you don't set custom recipients, emails will go to:
- Contact forms: info@theforwardhorizon.com
- Applications: admissions@theforwardhorizon.com
- Volunteer forms: volunteer@theforwardhorizon.com

Make sure these email addresses exist or override them with your actual email addresses.