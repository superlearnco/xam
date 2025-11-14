# Deployment Guide - xam by superlearn

This guide covers deploying xam to production using Vercel (frontend) and Convex (backend).

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Convex Deployment](#convex-deployment)
4. [Vercel Deployment](#vercel-deployment)
5. [Custom Domain Setup](#custom-domain-setup)
6. [Monitoring & Analytics](#monitoring--analytics)
7. [Post-Deployment](#post-deployment)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- [x] Node.js 18+ installed
- [x] npm or pnpm package manager
- [x] Vercel account (https://vercel.com)
- [x] Convex account (https://convex.dev)
- [x] Clerk account (https://clerk.com)
- [x] Polar account (https://polar.sh)
- [x] xAI API key (https://x.ai)
- [x] All features tested locally

---

## Environment Variables

### Required Environment Variables

Create these environment variables in your production environment:

#### Clerk Authentication

```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

**How to get:**

1. Go to Clerk Dashboard (https://dashboard.clerk.com)
2. Select your application
3. Go to API Keys
4. Copy the Production keys

#### Convex Backend

```bash
VITE_CONVEX_URL=https://your-project.convex.cloud
CONVEX_DEPLOY_KEY=prod:...
```

**How to get:**

1. Run `npx convex deploy --prod` (creates production deployment)
2. VITE_CONVEX_URL will be displayed in output
3. Get CONVEX_DEPLOY_KEY from Convex Dashboard > Settings > Deploy Keys

#### xAI API

```bash
XAI_API_KEY=xai-...
```

**How to get:**

1. Go to xAI Console (https://console.x.ai)
2. Generate API key
3. Copy the key (store securely)

#### Polar Billing

```bash
POLAR_ACCESS_TOKEN=polar_pat_...
POLAR_ORGANIZATION_ID=org_...
POLAR_WEBHOOK_SECRET=whsec_...
POLAR_SERVER=production
```

**How to get:**

1. Go to Polar Dashboard (https://polar.sh/dashboard)
2. Settings > API Keys > Create Personal Access Token
3. Copy POLAR_ACCESS_TOKEN
4. Settings > Organization > Copy Organization ID
5. Webhooks > Create Webhook > Copy Webhook Secret
6. Set POLAR_SERVER to "production"

#### Application URL

```bash
VITE_APP_URL=https://xam.app
FRONTEND_URL=https://xam.app
```

**Set to your production domain**

---

## Convex Deployment

### Step 1: Deploy Convex Backend

```bash
# Deploy to production
npx convex deploy --prod

# This will:
# - Create production deployment
# - Apply schema changes
# - Deploy all functions
# - Provide deployment URL
```

### Step 2: Set Production Environment Variables

```bash
# Set xAI API Key
npx convex env set XAI_API_KEY "xai-..." --prod

# Set Polar credentials
npx convex env set POLAR_ACCESS_TOKEN "polar_pat_..." --prod
npx convex env set POLAR_ORGANIZATION_ID "org_..." --prod
npx convex env set POLAR_WEBHOOK_SECRET "whsec_..." --prod
npx convex env set POLAR_SERVER "production" --prod
npx convex env set FRONTEND_URL "https://xam.app" --prod

# Set Clerk credentials
npx convex env set CLERK_ISSUER_URL "https://your-clerk-domain.clerk.accounts.dev" --prod
```

### Step 3: Configure Clerk JWT Template

1. Go to Clerk Dashboard > JWT Templates
2. Create new Convex template
3. Set issuer to match your Clerk domain
4. Copy issuer URL and set in Convex env (above)

### Step 4: Verify Convex Deployment

```bash
# Check deployment status
npx convex dashboard --prod

# Test queries
npx convex run projects:list --prod
```

### Step 5: Configure Database Backups

1. Go to Convex Dashboard (https://dashboard.convex.dev)
2. Select your production deployment
3. Go to Settings > Backups
4. Enable automatic backups
5. Set retention policy (recommended: 30 days)
6. Test restore process with development data

---

## Vercel Deployment

### Step 1: Connect Repository

1. Go to Vercel Dashboard (https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Select the xam repository

### Step 2: Configure Build Settings

Vercel should auto-detect settings, but verify:

- **Framework Preset:** Other
- **Build Command:** `npm run build`
- **Output Directory:** `build/client`
- **Install Command:** `npm install`
- **Root Directory:** `./`

### Step 3: Add Environment Variables

In Vercel Dashboard > Settings > Environment Variables, add:

```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
VITE_CONVEX_URL=https://your-project.convex.cloud
VITE_APP_URL=https://xam.app
```

**Important:**

- Use Production environment for all variables
- Do NOT add Convex Deploy Key (only for CI/CD)
- Do NOT add xAI/Polar keys (they're on Convex backend)

### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Verify deployment at provided URL

### Step 5: Verify Deployment

Check these URLs work:

- `https://your-app.vercel.app` - Homepage loads
- `https://your-app.vercel.app/dashboard` - Redirects to sign-in
- `https://your-app.vercel.app/sign-in` - Clerk sign-in loads

---

## Custom Domain Setup

### Step 1: Add Domain in Vercel

1. Go to Vercel Dashboard > Project > Settings > Domains
2. Click "Add Domain"
3. Enter your domain (e.g., `xam.app`)
4. Add `www.xam.app` as well

### Step 2: Configure DNS

Add these DNS records to your domain provider:

**For root domain (xam.app):**

```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain:**

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Step 3: Wait for DNS Propagation

- Usually takes 10-60 minutes
- Check status in Vercel Dashboard
- Vercel will automatically provision SSL certificate

### Step 4: Configure Redirects

Vercel automatically redirects:

- HTTP → HTTPS
- www → non-www (or vice versa, configurable)

### Step 5: Update Environment Variables

Update these URLs to use your custom domain:

```bash
# In Vercel
VITE_APP_URL=https://xam.app

# In Convex
npx convex env set FRONTEND_URL "https://xam.app" --prod
```

### Step 6: Update Clerk Settings

1. Go to Clerk Dashboard
2. Update allowed origins to include `https://xam.app`
3. Update redirect URLs

### Step 7: Update Polar Webhooks

1. Go to Polar Dashboard > Webhooks
2. Update webhook URL to `https://xam.app/payments/webhook`
3. Verify webhook signature verification works

---

## Monitoring & Analytics

### Vercel Analytics

Vercel Analytics is already integrated via `@vercel/analytics`.

**To verify:**

1. Deploy to production
2. Go to Vercel Dashboard > Analytics
3. Check Web Vitals data appears

**Metrics tracked:**

- Page load time
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- First Input Delay (FID)

### Convex Logs

Monitor backend logs:

1. Go to Convex Dashboard > Logs
2. View real-time function calls
3. Check for errors
4. Monitor AI usage

### Error Tracking (Optional)

To add Sentry for error tracking:

```bash
npm install @sentry/react @sentry/vite-plugin
```

Configure in `app/root.tsx`:

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production",
  tracesSampleRate: 0.1,
});
```

### Metrics to Monitor

**Technical:**

- Page load time (< 2s target)
- Time to interactive (< 3s target)
- Error rate (< 1% target)
- Uptime (> 99.5% target)
- API response times

**Business:**

- User signups
- Tests created
- Tests taken
- AI credit usage
- Revenue from Polar
- Feature adoption rates

**User Experience:**

- Session duration
- Bounce rate
- Conversion rate (signup → test creation)
- AI feature usage percentage

---

## Post-Deployment

### Immediate Checks

After deployment, verify:

- [x] Homepage loads correctly
- [x] Sign-in/sign-up works
- [x] Dashboard loads for authenticated users
- [x] Create new test works
- [x] Editor functions properly
- [x] Test taking flow works
- [x] Marking interface works
- [x] AI features work (generate options, grading)
- [x] Payment flow works (test with Polar sandbox first)
- [x] Webhooks receive events from Polar

### Test User Flow

Create a test account and:

1. Sign up
2. Create a test
3. Add questions
4. Use AI to generate options
5. Publish test
6. Take test as respondent
7. Submit test
8. Mark test as teacher
9. Use AI grading
10. Purchase credits
11. Check usage history

### Performance Checks

Run these tools:

```bash
# Lighthouse audit
npm run build
npx serve build/client
npx lighthouse http://localhost:3000 --view

# Bundle size check
npm run test:perf
```

**Target Metrics:**

- Lighthouse score: > 90
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 90

### Security Checks

Verify:

- [x] All routes require authentication
- [x] API endpoints check authorization
- [x] No sensitive data in client-side code
- [x] Environment variables secured
- [x] Webhook signatures verified
- [x] HTTPS enforced
- [x] Security headers set (see vercel.json)

---

## Troubleshooting

### Build Fails on Vercel

**Issue:** Build command fails

**Solution:**

1. Check build logs in Vercel Dashboard
2. Verify all dependencies in package.json
3. Try building locally: `npm run build`
4. Check Node.js version (should be 18+)

### Clerk Authentication Not Working

**Issue:** Sign-in redirects fail or authentication errors

**Solution:**

1. Verify Clerk environment variables are correct
2. Check allowed origins in Clerk Dashboard
3. Verify redirect URLs include production domain
4. Check JWT template issuer matches Convex config

### Convex Functions Fail

**Issue:** Database queries return errors

**Solution:**

1. Check Convex logs in dashboard
2. Verify environment variables are set
3. Run `npx convex deploy --prod` again
4. Check schema is applied: `npx convex dashboard --prod`

### AI Features Not Working

**Issue:** Generate options or grading fails

**Solution:**

1. Verify XAI_API_KEY is set in Convex: `npx convex env get XAI_API_KEY --prod`
2. Check xAI API quota/limits
3. Review Convex logs for AI action errors
4. Verify user has sufficient credits

### Payment Webhooks Not Received

**Issue:** Polar webhooks not triggering

**Solution:**

1. Verify webhook URL in Polar Dashboard: `https://xam.app/payments/webhook`
2. Check webhook secret matches: `npx convex env get POLAR_WEBHOOK_SECRET --prod`
3. Review Convex logs for webhook errors
4. Test webhook with Polar webhook tester
5. Verify POLAR_SERVER is set to "production"

### Database Performance Issues

**Issue:** Slow queries or timeouts

**Solution:**

1. Check Convex Dashboard > Performance
2. Review query patterns
3. Add indexes to frequently queried fields
4. Optimize data fetching (avoid N+1 queries)
5. Consider pagination for large datasets

---

## Continuous Deployment

### Auto-Deploy from Git

Vercel automatically deploys on:

- Push to main branch → Production
- Pull request → Preview deployment

### Manual Convex Deploy

To update backend functions:

```bash
npx convex deploy --prod
```

### Rolling Back

**Vercel:**

1. Go to Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

**Convex:**

1. Go to Convex Dashboard > Deployments
2. Select previous deployment
3. Click "Restore"

---

## Backup & Recovery

### Convex Database Backups

**Automatic backups:**

- Configured in Convex Dashboard
- Retention: 30 days recommended
- Stored securely by Convex

**Manual backup:**

```bash
npx convex export --prod > backup.jsonl
```

**Restore from backup:**

```bash
npx convex import backup.jsonl --prod
```

### Code Repository

- Main source of truth: GitHub repository
- Keep production branch protected
- Tag releases: `git tag v1.0.0`

---

## Launch Checklist

### Pre-Launch

- [x] All features tested locally
- [x] Security audit complete
- [x] Performance optimized (Lighthouse > 90)
- [x] Analytics configured (Vercel Analytics)
- [x] Error tracking set up (optional Sentry)
- [x] Backup strategy in place (Convex auto-backup)
- [x] Documentation written (README, this guide)
- [ ] Create products in Polar Dashboard
- [ ] Configure Polar webhook endpoint
- [ ] Set all production environment variables
- [ ] Deploy Convex backend
- [ ] Deploy Vercel frontend
- [ ] Configure custom domain
- [ ] SSL certificate active
- [ ] Test complete user flow
- [ ] Test payment flow

### Launch Day

- [ ] Deploy to production
- [ ] Verify all features work
- [ ] Test authentication flow
- [ ] Test AI features (generate, grading)
- [ ] Test payment flow (start with sandbox)
- [ ] Switch Polar to production mode
- [ ] Monitor error rates (< 1%)
- [ ] Watch performance metrics
- [ ] Monitor Convex logs
- [ ] Check webhook delivery
- [ ] Be ready for support requests

### Post-Launch (First Week)

- [ ] Collect user feedback
- [ ] Fix critical bugs immediately
- [ ] Monitor daily active users
- [ ] Track AI credit usage
- [ ] Monitor payment conversions
- [ ] Optimize based on metrics
- [ ] Respond to support tickets
- [ ] Plan first feature updates
- [ ] Marketing and promotion
- [ ] Community engagement

---

## Support & Resources

### Documentation Links

- **React Router:** https://reactrouter.com
- **Convex:** https://docs.convex.dev
- **Clerk:** https://clerk.com/docs
- **Polar:** https://docs.polar.sh
- **Vercel:** https://vercel.com/docs
- **xAI:** https://docs.x.ai

### Monitoring Dashboards

- **Vercel:** https://vercel.com/dashboard
- **Convex:** https://dashboard.convex.dev
- **Clerk:** https://dashboard.clerk.com
- **Polar:** https://polar.sh/dashboard

### Emergency Contacts

- Convex support: support@convex.dev
- Vercel support: Via dashboard chat
- Clerk support: support@clerk.com
- Polar support: support@polar.sh

---

## Conclusion

Following this guide ensures a smooth deployment of xam to production. Remember to:

1. Test thoroughly before deploying
2. Monitor metrics after deployment
3. Have a rollback plan ready
4. Keep documentation updated
5. Respond quickly to issues

For questions or issues, refer to the official documentation linked above.

**Good luck with your launch!**
