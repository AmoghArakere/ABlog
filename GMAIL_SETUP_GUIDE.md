# Setting Up Gmail for Sending Emails in ABlog

This guide will help you configure your Gmail account to send emails from your ABlog application.

## Step 1: Enable 2-Step Verification in Your Google Account

1. Go to your [Google Account](https://myaccount.google.com/)
2. Select "Security" from the left sidebar
3. Under "Signing in to Google," select "2-Step Verification"
4. Follow the steps to turn on 2-Step Verification

## Step 2: Create an App Password

1. Go to your [Google Account](https://myaccount.google.com/)
2. Select "Security" from the left sidebar
3. Under "Signing in to Google," select "App passwords" (you'll only see this if 2-Step Verification is enabled)
4. At the bottom, select "Select app" and choose "Other (Custom name)"
5. Enter "ABlog" or another name to help you identify this password
6. Click "Generate"
7. Google will display a 16-character app password. **Copy this password** as you'll need it for your application

## Step 3: Configure Your Environment Variables

1. Create a `.env` file in the root of your project (copy from `.env.example`)
2. Add the following configuration:

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASS=your-16-character-app-password
EMAIL_FROM=ABlog Support <your-gmail-address@gmail.com>
SITE_URL=https://your-production-url.com
```

Replace:
- `your-gmail-address@gmail.com` with your actual Gmail address
- `your-16-character-app-password` with the app password you generated in Step 2
- `https://your-production-url.com` with your actual production URL

## Step 4: Test Your Email Configuration

1. Start your application
2. Try the "Forgot Password" feature
3. Check if the email is sent successfully

## Troubleshooting

If you encounter issues:

1. **Emails not sending**: Check your console logs for error messages
2. **Authentication errors**: Verify your app password is correct
3. **Gmail blocking**: Check if Gmail is blocking the login attempt (you might receive an email from Google about this)
4. **Rate limits**: Gmail has sending limits (500 emails per day for regular accounts)

## Production Considerations

For a production application with higher email volume, consider using a dedicated email service like:

- [SendGrid](https://sendgrid.com/)
- [Mailgun](https://www.mailgun.com/)
- [Amazon SES](https://aws.amazon.com/ses/)

These services offer better deliverability, higher sending limits, and detailed analytics.
