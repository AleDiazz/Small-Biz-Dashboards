# Analytics & Monitoring Setup Guide

This guide will help you configure Sentry, Google Analytics 4, and Vercel Analytics for your project.

## 📦 Installed Packages

The following packages have been installed:
- `@sentry/nextjs` - Error tracking and performance monitoring
- `@vercel/analytics` - Vercel Analytics
- `@next/third-parties` - Next.js optimized third-party scripts (for GA4)

## 🔧 Configuration

### 1. Sentry Setup

Sentry has been configured with three configuration files:
- `sentry.client.config.ts` - Client-side error tracking
- `sentry.server.config.ts` - Server-side error tracking
- `sentry.edge.config.ts` - Edge runtime error tracking

#### Steps to Configure Sentry:

1. **Create a Sentry Account** (if you don't have one):
   - Go to https://sentry.io/signup/
   - Create a new account or sign in

2. **Create a New Project**:
   - In Sentry dashboard, click "Create Project"
   - Select "Next.js" as the platform
   - Give your project a name

3. **Get Your DSN**:
   - After creating the project, you'll see your DSN (Data Source Name)
   - It looks like: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`

4. **Set Environment Variables**:
   Add the following to your `.env.local` file:
   ```env
   NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
   SENTRY_ORG=your_sentry_org_slug
   SENTRY_PROJECT=your_sentry_project_slug
   ```

5. **Get Org and Project Slugs**:
   - Org slug: Found in your Sentry URL or organization settings
   - Project slug: Found in your project settings URL

#### Sentry Features Enabled:
- ✅ Error tracking (client & server)
- ✅ Performance monitoring
- ✅ Session Replay (10% sample rate, 100% on errors)
- ✅ Source map uploads (for better stack traces)
- ✅ Automatic Vercel Cron Monitor instrumentation
- ✅ Tunnel route at `/monitoring` to bypass ad-blockers

### 2. Google Analytics 4 Setup

#### Steps to Configure GA4:

1. **Create a GA4 Property** (if you don't have one):
   - Go to https://analytics.google.com/
   - Click "Admin" → "Create Property"
   - Follow the setup wizard

2. **Get Your Measurement ID**:
   - In GA4, go to Admin → Data Streams
   - Click on your web stream
   - Copy your Measurement ID (format: `G-XXXXXXXXXX`)

3. **Set Environment Variable**:
   Add to your `.env.local` file:
   ```env
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   ```

4. **Verify Installation**:
   - Deploy your app or run in production mode
   - Visit your site and check GA4 Real-Time reports
   - You should see your visit appear within seconds

### 3. Vercel Analytics Setup

Vercel Analytics is **automatically enabled** when you deploy to Vercel. No additional configuration is needed!

#### Features:
- ✅ Automatic page view tracking
- ✅ Web Vitals monitoring (Core Web Vitals)
- ✅ Real-time analytics dashboard in Vercel

#### To View Analytics:
1. Deploy your app to Vercel
2. Go to your project dashboard on Vercel
3. Click on the "Analytics" tab
4. View real-time and historical data

## 🚀 Testing Your Setup

### Test Sentry:
1. Add a test error in your code (temporarily):
   ```typescript
   // In any component or API route
   throw new Error("Test Sentry error");
   ```
2. Trigger the error
3. Check your Sentry dashboard - you should see the error appear

### Test GA4:
1. Visit your deployed site
2. Go to GA4 → Reports → Realtime
3. You should see your visit appear

### Test Vercel Analytics:
1. Deploy to Vercel
2. Visit your site
3. Check Vercel dashboard → Analytics tab

## 📝 Environment Variables Summary

Add these to your `.env.local` file:

```env
# Sentry
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_ORG=your_org_slug
SENTRY_PROJECT=your_project_slug

# Google Analytics 4
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

## 🔒 Production Considerations

### Sentry:
- Adjust `tracesSampleRate` in config files for production (currently set to 1.0 = 100%)
- Recommended: 0.1 (10%) for production to reduce overhead
- Adjust `replaysSessionSampleRate` for Session Replay (currently 0.1 = 10%)

### GA4:
- Consider implementing consent management for GDPR compliance
- Use GA4's built-in IP anonymization features

### Vercel Analytics:
- Automatically respects privacy settings
- No additional configuration needed

## 📚 Additional Resources

- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Google Analytics 4 Setup](https://support.google.com/analytics/answer/9304153)
- [Vercel Analytics Docs](https://vercel.com/docs/analytics)

## 🐛 Troubleshooting

### Sentry not working?
- Check that `NEXT_PUBLIC_SENTRY_DSN` is set correctly
- Verify the DSN is accessible (not blocked by firewall)
- Check browser console for Sentry initialization errors

### GA4 not tracking?
- Verify `NEXT_PUBLIC_GA_ID` is set correctly
- Check that the ID starts with `G-`
- Use browser DevTools → Network tab to see if GA4 requests are being made
- Check ad-blockers (they may block GA4)

### Vercel Analytics not showing?
- Ensure you're deployed to Vercel (not just running locally)
- Check that you're on a Vercel plan that includes Analytics
- Wait a few minutes for data to appear

