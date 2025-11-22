# 🚀 BizOps Lite - Small Business Dashboard

A modern, mobile-first dashboard for Puerto Rico small businesses to track revenue, expenses, and inventory with subscription-based tiers.

---

## 📋 Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
- [Tech Stack](#-tech-stack)
- [Setup Guide](#-setup-guide)
- [Stripe Integration](#-stripe-integration)
- [Security Rules](#-security-rules)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Subscription Tiers](#-subscription-tiers)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Features

### Core Features
- 🏢 **Multi-Business Management** - Manage multiple businesses, switch seamlessly
- 💰 **Revenue Tracking** - Track income by source with detailed analytics
- 💳 **Expense Management** - Categorize and monitor business expenses
- 📦 **Inventory Management** - Track stock levels with low-stock alerts
- ⚡ **Quick Adjustments** - Fast +/- buttons for inventory updates
- 📊 **Analytics Dashboard** - Charts, metrics, and trends
- 📅 **Time Period Filtering** - View data by Week, Month, or Year
- 📄 **PDF Reports** - Export comprehensive reports for any time period
- 🔐 **Secure Authentication** - Firebase Auth with email/password
- 💎 **Stripe Subscriptions** - Three-tier pricing ($15/$30/$50/month)
- 📱 **Mobile Responsive** - Beautiful UI on all devices

### Analytics & Insights
- Revenue vs Expenses comparison charts
- Revenue breakdown by source (pie chart)
- Expense breakdown by category (pie chart)
- Net profit tracking with trend indicators
- Top revenue sources & expense categories
- Recent transactions feed
- Low stock inventory alerts
- Period-over-period comparisons

### Subscription Management
- Self-service billing portal
- Upgrade/downgrade plans
- Payment method management
- Automatic webhook syncing
- Three tiers: Basic (1 business), Pro (3 businesses), Unlimited

---

## ⚡ Quick Start

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd "SmallBuisness Dashboard"
npm install
```

### 2. Environment Setup
Create `.env.local` with your Firebase credentials:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Firebase Admin SDK (for webhooks)
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Key-Here\n-----END PRIVATE KEY-----"

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
NEXT_PUBLIC_STRIPE_PRICE_BASIC=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_UNLIMITED=price_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### 3. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000`

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage
- **Payments**: Stripe
- **Charts**: Recharts
- **PDF Generation**: jsPDF + jspdf-autotable
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns

---

## 🔧 Setup Guide

### Step 1: Firebase Setup (10 minutes)

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project"
   - Name: "BizOps Lite"
   - Enable Google Analytics (optional)

2. **Enable Authentication**
   - Go to Authentication → Sign-in method
   - Enable "Email/Password"

3. **Create Firestore Database**
   - Go to Firestore Database → Create database
   - Start in production mode (we'll add rules next)
   - Choose your region

4. **Get Firebase Config**
   - Project Settings → General → Your apps
   - Click web app icon (</>) → Register app
   - Copy configuration values to `.env.local`

5. **Get Admin SDK Credentials**
   - Project Settings → Service accounts
   - Click "Generate new private key"
   - Download JSON file
   - Copy `client_email` and `private_key` to `.env.local`

### Step 2: Deploy Security Rules (5 minutes)

1. **Go to**: Firestore Database → Rules tab
2. **Copy contents** of `firestore.rules` file
3. **Paste** into editor
4. **Click "Publish"**

5. **Go to**: Storage → Rules tab
6. **Copy contents** of `storage.rules` file
7. **Paste** into editor
8. **Click "Publish"**

### Step 3: Stripe Setup (30 minutes)

1. **Create Stripe Account**
   - Go to [stripe.com](https://stripe.com)
   - Sign up (starts in Test Mode)

2. **Create Products**
   
   Create 3 subscription products:
   
   **Basic Plan**:
   - Name: "Basic Plan"
   - Price: $15/month
   - Copy Price ID → `NEXT_PUBLIC_STRIPE_PRICE_BASIC`
   
   **Pro Plan**:
   - Name: "Pro Plan"
   - Price: $30/month
   - Copy Price ID → `NEXT_PUBLIC_STRIPE_PRICE_PRO`
   
   **Unlimited Plan**:
   - Name: "Unlimited Plan"
   - Price: $50/month
   - Copy Price ID → `NEXT_PUBLIC_STRIPE_PRICE_UNLIMITED`

3. **Get API Keys**
   - Developers → API keys
   - Copy Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Copy Secret key → `STRIPE_SECRET_KEY`

4. **Enable Customer Portal**
   - Settings → Billing → Customer portal
   - Click "Activate test link"
   - Enable: Update payment methods, Update subscriptions, Cancel subscriptions
   - Save

5. **Setup Webhooks (Development)**
   ```bash
   # Install Stripe CLI
   brew install stripe/stripe-cli/stripe
   
   # Login
   stripe login
   
   # Forward webhooks (keep running)
   stripe listen --forward-to localhost:3000/api/stripe-webhook
   
   # Copy webhook secret to .env.local
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

6. **Test Subscription**
   - Go to Settings page
   - Click "Upgrade"
   - Use test card: `4242 4242 4242 4242`
   - Expiry: any future date
   - CVC: any 3 digits

---

## 💳 Stripe Integration

### How It Works

**Checkout Flow**:
1. User clicks "Upgrade" → API creates checkout session
2. Redirects to Stripe Checkout
3. User enters payment info
4. Stripe processes payment
5. Webhook fires → Updates Firestore
6. User redirected back → Success!

**Customer Portal**:
- Users click "Manage Subscription & Billing"
- Opens Stripe portal (hosted by Stripe)
- Can update cards, change plans, cancel
- Changes trigger webhooks → auto-sync to Firestore

**Webhook Events Handled**:
- `checkout.session.completed` - New subscription activated
- `customer.subscription.updated` - Plan changed
- `customer.subscription.deleted` - Subscription canceled
- `invoice.payment_succeeded` - Successful payment
- `invoice.payment_failed` - Failed payment

### Test Cards
| Card Number | Result |
|-------------|--------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 9995` | Declined |
| `4000 0025 0000 3155` | Requires authentication |

### Going Live
1. Activate Stripe account (complete verification)
2. Switch to Live Mode in Stripe Dashboard
3. Create live products (same as test)
4. Update `.env.local` with live API keys
5. Create production webhook endpoint
6. Test with real card (small amount, refund)

---

## 🔐 Security Rules

### Security Model
- ✅ Users can only access their own data
- ✅ Business owners control their business data
- ✅ Transactions tied to business ownership
- ✅ Subscription tiers cannot be modified by users
- ✅ Server-side operations use Admin SDK (bypass rules)

### What's Protected
- **Users**: Own profile only
- **Businesses**: Own businesses only
- **Revenues**: Only from owned businesses
- **Expenses**: Only from owned businesses
- **Inventory**: Only from owned businesses

### Required Fields Validation

**Business Creation**:
```javascript
{ name, industry, userId, createdAt }
```

**Revenue Creation**:
```javascript
{ businessId, amount, source, date }
```

**Expense Creation**:
```javascript
{ businessId, amount, category, date }
```

**Inventory Creation**:
```javascript
{ businessId, name, quantity, minQuantity, unit, cost, createdAt, updatedAt, userId }
```

---

## 🚀 Deployment

### Vercel (Recommended - 15 minutes)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Connect GitHub repository
   - Add environment variables (all from `.env.local`)
   - Click "Deploy"

3. **Setup Production Webhook**
   - Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/stripe-webhook`
   - Select events: checkout.session.completed, customer.subscription.*, invoice.*
   - Copy signing secret → Update production env vars

4. **Verify Deployment**
   - Test login/signup
   - Create test business
   - Add test transactions
   - Test subscription flow
   - Generate PDF report

---

## 📁 Project Structure

```
/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Landing page
│   ├── login/page.tsx           # Login page
│   ├── signup/page.tsx          # Signup page
│   ├── onboarding/page.tsx      # New user onboarding
│   ├── dashboard/
│   │   ├── page.tsx             # Main dashboard with analytics
│   │   ├── transactions/page.tsx # Unified revenue & expenses
│   │   ├── inventory/page.tsx   # Inventory management
│   │   ├── settings/page.tsx    # User settings & subscriptions
│   │   └── add-business/page.tsx # Create new business
│   └── api/
│       ├── create-checkout-session/route.ts  # Stripe checkout
│       ├── create-portal-session/route.ts    # Customer portal
│       └── stripe-webhook/route.ts           # Webhook handler
│
├── components/                   # React components
│   ├── DashboardLayout.tsx      # Main layout with nav
│   ├── FloatingActionButton.tsx # Quick action FAB
│   ├── TimeRangeSelector.tsx    # Time period filter
│   └── ComparisonBadge.tsx      # Trend indicators
│
├── contexts/                     # React Context
│   └── BusinessContext.tsx      # Global business state
│
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts              # Authentication hook
│   └── useBusiness.ts          # Business data hook
│
├── lib/                          # Utilities
│   ├── firebase.ts             # Firebase client SDK
│   ├── firebase-admin.ts       # Firebase Admin SDK
│   ├── stripe.ts               # Stripe configuration
│   ├── pdfGenerator.ts         # PDF report generation
│   └── utils.ts                # Helper functions
│
├── types/                        # TypeScript types
│   └── index.ts                # Type definitions
│
├── firestore.rules              # Database security rules
├── storage.rules                # Storage security rules
└── .env.local                   # Environment variables (not in Git)
```

---

## 💰 Subscription Tiers

| Feature | Basic ($15/mo) | Pro ($30/mo) | Unlimited ($50/mo) |
|---------|----------------|--------------|-------------------|
| Businesses | 1 | 3 | Unlimited |
| Revenue Tracking | ✅ | ✅ | ✅ |
| Expense Tracking | ✅ | ✅ | ✅ |
| Inventory Management | ✅ | ✅ | ✅ |
| Analytics Dashboard | ✅ | ✅ | ✅ |
| PDF Reports | ✅ | ✅ | ✅ |
| Mobile App | ✅ | ✅ | ✅ |
| Email Support | ✅ | ✅ | Priority |

**Stripe Pricing**: 2.9% + $0.30 per transaction (no monthly fees to Stripe)

---

## 🐛 Troubleshooting

### "Missing or insufficient permissions"

**Cause**: Security rules blocking operation

**Fix**:
1. Verify you're logged in
2. Check security rules are deployed correctly
3. Verify field names match what rules expect
4. Check browser console for detailed error

### "Failed to save item/transaction"

**Cause**: Missing required fields or security rule mismatch

**Fix**:
1. Check browser console (F12) for exact error
2. Verify all required fields are present
3. Ensure field names match security rules exactly

### Webhook not updating subscription

**Cause**: Webhook secret missing or incorrect

**Fix**:
1. Verify `STRIPE_WEBHOOK_SECRET` in `.env.local`
2. Ensure `stripe listen` is running (dev)
3. Check webhook signing secret matches
4. Restart dev server after adding secret

### "No user found for customer"

**Cause**: Customer ID mapping missing in Firestore

**Fix**:
- This is normal for the first webhook event
- Subsequent events will work once mapping is created
- Check `stripe_customers` collection in Firestore

### Stripe checkout failing

**Cause**: Missing Stripe configuration

**Fix**:
1. Verify all `NEXT_PUBLIC_STRIPE_PRICE_*` variables
2. Ensure Price IDs (not Product IDs) are used
3. Check `STRIPE_SECRET_KEY` is correct
4. Restart server after adding keys

---

## 📝 Environment Variables Reference

### Required for Basic Operation
```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

### Required for Stripe Payments
```env
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_STRIPE_PRICE_BASIC=
NEXT_PUBLIC_STRIPE_PRICE_PRO=
NEXT_PUBLIC_STRIPE_PRICE_UNLIMITED=
STRIPE_WEBHOOK_SECRET=
```

### Required for Webhooks
```env
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

---

## 🎯 Production Checklist

Before launching to real users:

- [ ] Firebase security rules deployed
- [ ] Storage rules deployed
- [ ] All environment variables configured
- [ ] Stripe products created
- [ ] Stripe live mode activated
- [ ] Production webhook configured
- [ ] Test all user flows
- [ ] Test subscription checkout
- [ ] Test customer portal
- [ ] Generate test PDF reports
- [ ] Verify mobile responsiveness
- [ ] Set up monitoring/analytics
- [ ] Create support email/documentation

---

## 🤝 Support

- **Firebase Docs**: https://firebase.google.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Stripe Support**: 24/7 chat support in dashboard

---

## 📄 License

MIT License - Built for Puerto Rico small businesses

---

**Made with ❤️ for Puerto Rico small businesses**

Version: 2.3.0 | Status: Production Ready | Last Updated: November 22, 2025
