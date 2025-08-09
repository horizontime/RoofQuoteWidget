# Email Setup Guide for Roof Quote Pro

This guide explains how to configure SendGrid for sending quote emails with PDF attachments.

## Prerequisites

1. A SendGrid account (free tier is sufficient for testing)
2. Python with SendGrid package installed (`pip install sendgrid`)

## Setup Steps

### 1. Get Your SendGrid API Key

1. Sign up for SendGrid at https://sendgrid.com
2. Go to Settings → API Keys: https://app.sendgrid.com/settings/api_keys
3. Click "Create API Key"
4. Give it a name (e.g., "Roof Quote Pro")
5. Select "Full Access" for permissions
6. Copy the API key (starts with `SG.`)

### 2. Configure Sender Authentication

1. Go to Settings → Sender Authentication
2. Verify a single sender email address OR authenticate your domain
3. For testing, single sender verification is quickest:
   - Click "Verify a Single Sender"
   - Enter your email details
   - Check your email and click the verification link

### 3. Configure the Application

1. Copy the example environment file:
   ```bash
   cp .env.example sendgrid.env
   ```

2. Edit `sendgrid.env` and add your configuration:
   ```env
   SENDGRID_API_KEY=SG.your_actual_api_key_here
   SENDGRID_FROM_EMAIL=quotes@yourdomain.com  # Must be verified in SendGrid
   SENDGRID_REPLY_TO=support@yourdomain.com   # Optional
   ```

### 4. Test Your Configuration

Run the test script to verify everything is working:

```bash
python test_email_setup.py
```

This script will:
- Check your configuration
- Verify the SendGrid connection
- Optionally send a test email

### 5. Start Using the Email Feature

Once configured, the application can:
- Send quote emails to leads
- Attach PDF quotes to emails
- Track email sending status

## API Endpoints

### Send Quote Email
```
POST /api/send-quote-email
{
  "to_email": "customer@example.com",
  "subject": "Your Roofing Quote",
  "email_content": "Dear Customer...",
  "pdf_base64": "base64_encoded_pdf_content",  // Optional
  "lead_name": "John Doe"
}
```

### Check Email Configuration Status
```
GET /api/email-config-status
```

### Send Test Email
```
POST /api/test-email
{
  "email": "test@example.com"
}
```

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Invalid API key
   - Check that your API key is correct in sendgrid.env
   - Make sure the key starts with `SG.`

2. **403 Forbidden**: Sender not verified
   - Verify your sender email in SendGrid dashboard
   - Use a verified email address in SENDGRID_FROM_EMAIL

3. **Email not received**: 
   - Check spam folder
   - Verify sender authentication in SendGrid
   - Check SendGrid activity feed for delivery status

### Testing Without SendGrid

If you don't have SendGrid configured yet, the application will:
- Log email sending attempts
- Return appropriate error messages
- Allow you to test other features

## Security Notes

- Never commit `sendgrid.env` to version control
- Keep your API key secret
- Use environment variables in production
- Rotate API keys periodically

## Support

For SendGrid support: https://support.sendgrid.com
For application issues: Contact your system administrator