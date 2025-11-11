# Analytics Integration Guide

This guide explains how to use the analytics tracking system in Xam.

## Overview

Xam uses a dual analytics approach:
- **Databuddy**: External analytics service for tracking user behavior and events
- **Convex**: Internal analytics database for detailed metrics and admin dashboard

## Setup

### 1. Environment Variables

Add these to your `.env.local`:

```bash
NEXT_PUBLIC_DATABUDDY_SITE_ID=your_databuddy_site_id
```

### 2. Automatic Initialization

The analytics system is automatically initialized in the root layout via `AnalyticsProvider`. No manual initialization needed.

## Usage Examples

### Basic Event Tracking

```typescript
import { trackEvent } from '@/lib/analytics/track';

// Track a simple event
trackEvent('project_created', {
  projectId: '123',
  projectType: 'multiple_choice'
});
```

### Page View Tracking

```typescript
import { trackPageView } from '@/lib/analytics/track';

// In your page component
useEffect(() => {
  trackPageView('/dashboard', 'Dashboard');
}, []);
```

### Project Events

```typescript
import { projectAnalytics, enhancedProjectAnalytics } from '@/lib/analytics/track';

// When creating a project
projectAnalytics.created(projectId, 'multiple_choice');

// When opening a project
enhancedProjectAnalytics.opened(projectId, 'survey');

// When publishing a project
projectAnalytics.published(projectId, questionCount);

// When sharing
enhancedProjectAnalytics.shareLinkCopied(projectId);
```

### Authentication Events

```typescript
import { authAnalytics, identifyUser } from '@/lib/analytics/track';

// Track signup
authAnalytics.signupStarted('google');
authAnalytics.signupCompleted(userId, 'google');

// Identify user with traits
identifyUser(userId, {
  email: user.email,
  name: user.name,
  plan: 'free',
  createdAt: Date.now()
});

// Track signin
authAnalytics.signinCompleted(userId, 'email');
```

### AI Feature Usage

```typescript
import { aiAnalytics } from '@/lib/analytics/track';

// Before AI generation
aiAnalytics.generationRequested('question_generation', creditsRequired, {
  count: 10,
  difficulty: 'medium'
});

// After AI generation
aiAnalytics.generationCompleted('question_generation', true, tokensUsed);
```

### Test Taking Events

```typescript
import { testAnalytics, testTakingAnalytics } from '@/lib/analytics/track';

// When test starts
testAnalytics.started(projectId, studentEmail);

// When answering questions
testTakingAnalytics.questionAnswered(submissionId, questionId, timeSpent);

// When flagging questions
testTakingAnalytics.questionFlagged(submissionId, questionId);

// When navigating
testTakingAnalytics.navigation(submissionId, fromQuestion, toQuestion);

// When submitting
testAnalytics.submitted(submissionId, projectId, totalTimeSpent, score);
```

### Marking Events

```typescript
import { markingAnalytics } from '@/lib/analytics/track';

// When opening marking page
markingAnalytics.pageOpened(projectId, submissionCount);

// When marking a submission
markingAnalytics.submissionMarked(submissionId, projectId, timeSpent);

// When using AI grading
markingAnalytics.aiGradingUsed(submissionId, questionCount);

// When exporting grades
markingAnalytics.gradesExported(projectId, 'csv', count);
```

### Billing Events

```typescript
import { enhancedBillingAnalytics } from '@/lib/analytics/track';

// When viewing pricing
enhancedBillingAnalytics.pricingPageViewed();

// When clicking a plan
enhancedBillingAnalytics.planCardClicked('Pro Plan', 50);

// When initiating checkout
enhancedBillingAnalytics.checkoutInitiated(productId, amount);

// When payment completes
enhancedBillingAnalytics.paymentCompleted(userId, amount, credits);
```

### Time Tracking

```typescript
import { trackTimeSpent } from '@/lib/analytics/track';

// Record start time
const startTime = Date.now();

// ... user performs activity ...

// Track time spent
trackTimeSpent('project_editing', startTime, {
  projectId: '123',
  changes: 5
});
```

## Convex Analytics Queries

### Track Custom Events in Database

```typescript
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

const trackEvent = useMutation(api.analytics.trackEvent);

// Track event in Convex
await trackEvent({
  eventType: 'custom_event',
  userId,
  projectId,
  metadata: { key: 'value' }
});
```

### Query Analytics Data

```typescript
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

// Get dashboard stats
const stats = useQuery(api.analytics.getDashboardStats, {
  startDate: Date.now() - 30 * 24 * 60 * 60 * 1000,
  endDate: Date.now()
});

// Get user growth
const growth = useQuery(api.analytics.getUserGrowth, { days: 30 });

// Get most active users
const activeUsers = useQuery(api.analytics.getMostActiveUsers, { limit: 10 });
```

## Admin Analytics Dashboard

Access the admin analytics dashboard at `/app/admin/analytics` to view:

- Total users, projects, submissions
- Growth charts (daily/weekly/monthly)
- Revenue metrics
- Credit usage patterns
- Feature usage statistics
- Error rates and tracking
- Conversion funnels
- Most active users

## Best Practices

1. **Track Early, Track Often**: Add analytics tracking as you build features
2. **Use Descriptive Names**: Event names should be clear and consistent
3. **Include Context**: Pass relevant metadata with events
4. **Protect User Privacy**: Don't track sensitive information
5. **Test Tracking**: Verify events are firing correctly in development
6. **Use Type Safety**: Import from the tracking library for type checking

## Event Naming Convention

Follow this pattern for consistency:

- **Format**: `noun_verb` or `category_action`
- **Examples**:
  - `project_created`
  - `question_deleted`
  - `test_submitted`
  - `payment_completed`

## Debugging

In development mode, all analytics events are logged to the console:

```
[Analytics] project_created { projectId: '123', projectType: 'multiple_choice' }
```

Check your browser console to verify events are firing correctly.

## Privacy & GDPR Compliance

- Users can opt-out of analytics tracking
- No personally identifiable information (PII) is tracked without consent
- All analytics data is encrypted in transit and at rest
- Data retention policies are enforced

## Support

For questions or issues with analytics:
1. Check the console for errors
2. Verify environment variables are set
3. Check Databuddy dashboard for data
4. Review the admin analytics dashboard