# xam by superlearn

AI-powered test creation and grading platform for teachers. Create, distribute, and grade tests, essays, and surveys with advanced AI assistance.

## Features

- 🚀 **React Router v7** - Modern full-stack React framework with SSR
- 🎨 **Drag-and-Drop Form Builder** - Intuitive test creation
- 📝 **10+ Field Types** - Multiple choice, essays, surveys, and more
- 🤖 **AI-Powered Features** - Generate questions, auto-grade responses
- 🔐 **Authentication with Clerk** - Secure user management
- 💳 **Flexible Billing with Polar** - Pay-per-use credits or pay-as-you-go
- 🗄️ **Real-time Database with Convex** - Serverless backend
- 📊 **Advanced Analytics** - Grade distribution, class averages, insights
- 🎯 **Custom Branding** - Personalize test appearance
- 🔒 **Access Control** - Password protection, email restrictions
- ⏱️ **Time Limits** - Configurable test timers
- 📱 **Responsive Design** - Works on all devices
- 🚢 **Vercel Deployment Ready** - Production-ready configuration

## Tech Stack

### Frontend
- **React Router v7** - Full-stack React framework
- **TailwindCSS v4** - Utility-first CSS framework
- **shadcn/ui** - Modern component library with Radix UI
- **Lucide React & Tabler Icons** - Beautiful icon libraries
- **Recharts** - Data visualization
- **Motion** - Smooth animations

### Backend & Services
- **Convex** - Real-time database and serverless functions
- **Clerk** - Authentication and user management
- **Polar.sh** - Subscription billing and payments
- **Vercel AI Gateway** - Unified AI API gateway for xAI (Grok) models and OpenAI models

### Development & Deployment
- **Vite** - Fast build tool
- **TypeScript** - Type safety
- **Vercel** - Deployment platform

## Getting Started

### Prerequisites

- Node.js 18+ 
- Clerk account for authentication
- Convex account for database
- Polar.sh account for billing
- xAI API key (for AI features)

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Copy the environment file and configure your credentials:

```bash
cp .env.example .env.local
```

3. Set up your environment variables in `.env.local`:

```bash
# Convex Configuration
CONVEX_DEPLOYMENT=your_convex_deployment_here
VITE_CONVEX_URL=your_convex_url_here

# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here

# Polar.sh Configuration (set in Convex)
POLAR_ACCESS_TOKEN=your_polar_access_token_here
POLAR_ORGANIZATION_ID=your_polar_organization_id_here
POLAR_WEBHOOK_SECRET=your_polar_webhook_secret_here
POLAR_SERVER=sandbox

# xAI Configuration (set in Convex)
XAI_API_KEY=your_xai_api_key_here

# Frontend URL for redirects
VITE_APP_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

4. Initialize Convex:

```bash
npx convex dev
```

5. Set environment variables in Convex:

```bash
npx convex env set XAI_API_KEY "your_xai_api_key_here"
npx convex env set POLAR_ACCESS_TOKEN "your_polar_access_token_here"
npx convex env set POLAR_ORGANIZATION_ID "your_polar_organization_id_here"
npx convex env set POLAR_WEBHOOK_SECRET "your_polar_webhook_secret_here"
npx convex env set POLAR_SERVER "sandbox"
npx convex env set FRONTEND_URL "http://localhost:5173"
```

6. Set up your Polar.sh webhook endpoint:
   - URL: `{your_domain}/payments/webhook`
   - Events: `order.created`, `subscription.created`, `subscription.updated`, `subscription.canceled`

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Testing

Run the comprehensive test suite:

```bash
# Unit tests
npm test

# E2E tests with Playwright
npm run test:e2e

# Performance tests (bundle size)
npm run test:perf

# Production checklist
npx tsx scripts/production-checklist.ts
```

## Deployment

### Quick Start

For comprehensive deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Vercel Deployment (Recommended)

This application is optimized for Vercel deployment:

1. **Deploy Convex Backend:**
   ```bash
   npx convex deploy --prod
   npx convex env set XAI_API_KEY "xai-..." --prod
   npx convex env set POLAR_ACCESS_TOKEN "polar_pat_..." --prod
   # ... set other environment variables
   ```

2. **Deploy to Vercel:**
   - Connect your repository to Vercel
   - Set environment variables in Vercel dashboard:
     - `VITE_CLERK_PUBLISHABLE_KEY`
     - `CLERK_SECRET_KEY`
     - `VITE_CONVEX_URL`
     - `VITE_APP_URL`
   - Deploy automatically on push to main branch

3. **Configure Custom Domain:**
   - Add domain in Vercel dashboard
   - Update DNS records
   - SSL automatically provisioned

4. **Post-Deployment:**
   - Verify all features work
   - Test payment flow
   - Monitor analytics and errors

### Production Checklist

Before deploying, run the production checklist:

```bash
npx tsx scripts/production-checklist.ts
```

This verifies:
- Build succeeds
- TypeScript compiles
- Tests pass
- Security headers configured
- Analytics integrated
- Documentation exists
- Code quality checks

## Architecture

### Key Routes

**Public Routes:**
- `/` - Homepage with features and pricing
- `/pricing` - Pricing page
- `/sign-in` - Sign in page
- `/sign-up` - Sign up page
- `/take/:projectId` - Test start screen (public)
- `/take/:projectId/:submissionId` - Take test
- `/take/:projectId/:submissionId/success` - Submission success

**Protected Routes (Require Authentication):**
- `/dashboard` - User dashboard with projects
- `/dashboard/settings` - User settings and AI credits
- `/projects/:projectId/editor` - Drag-and-drop form builder
- `/projects/:projectId/options` - Test configuration
- `/projects/:projectId/marking` - Marking overview
- `/projects/:projectId/marking/:submissionId` - Individual marking

**API Routes:**
- `/payments/webhook` - Polar.sh webhook handler

### Key Components

#### Authentication & Authorization
- Protected routes with Clerk authentication
- Server-side user data loading with loaders
- Automatic user synchronization

#### Test Creation & Management
- Drag-and-drop form builder with real-time updates
- 10+ field types: multiple choice, essays, file uploads, ratings, etc.
- Auto-save functionality with debouncing
- Field reordering with @dnd-kit
- AI-powered question generation

#### Test Configuration
- Custom branding (colors, logo, header)
- Access control (password, email domain restrictions)
- Test settings (time limits, progress bar, question shuffling)
- Feedback settings (instant feedback, show answers)
- Submission settings (multiple submissions, close dates)

#### Test Taking
- Public test-taking interface with custom branding
- Timer with auto-submit on timeout
- Progress tracking
- Auto-save responses
- Submission confirmation

#### Marking & Grading
- Manual marking interface with question navigator
- AI-assisted grading for text responses
- Bulk AI marking for multiple submissions
- Grade distribution analytics
- Class average and statistics

#### Billing & Credits
- Pay-per-use credits ($1 = 10 credits)
- Pay-as-you-go subscription with metered billing
- Real-time credit balance tracking
- Usage history with detailed breakdowns
- Secure payment flow via Polar.sh

## Environment Variables

### Required for Production

**Vercel Environment Variables:**
- `VITE_CLERK_PUBLISHABLE_KEY` - Clerk publishable key (production)
- `CLERK_SECRET_KEY` - Clerk secret key (production)
- `VITE_CONVEX_URL` - Your Convex deployment URL
- `VITE_APP_URL` - Your production domain (e.g., https://xam.app)

**Convex Environment Variables (set via `npx convex env set`):**
- `AI_GATEWAY_API_KEY` - Vercel AI Gateway API key (recommended, used for all AI models)
- `XAI_API_KEY` - xAI API key for Grok models (fallback if AI_GATEWAY_API_KEY not set)
- `AI_GATEWAY_URL` - Vercel AI Gateway URL (optional, defaults to `https://gateway.vercel.ai/v1`)
- `POLAR_ACCESS_TOKEN` - Polar.sh API access token
- `POLAR_ORGANIZATION_ID` - Your Polar.sh organization ID
- `POLAR_WEBHOOK_SECRET` - Polar.sh webhook secret
- `POLAR_SERVER` - Set to "production" for production
- `FRONTEND_URL` - Your production domain for redirects
- `CLERK_ISSUER_URL` - Clerk JWT issuer URL

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed setup instructions.

## Project Structure

```
├── app/
│   ├── components/
│   │   ├── ui/            # shadcn/ui components
│   │   ├── shared/        # Shared components (StatCard, AnimatedNumber, etc.)
│   │   ├── homepage/      # Homepage sections
│   │   ├── dashboard/     # Dashboard components
│   │   ├── editor/        # Form builder components
│   │   ├── options/       # Test configuration components
│   │   ├── test-taking/   # Test-taking interface
│   │   └── marking/       # Marking and grading components
│   ├── routes/            # React Router routes
│   ├── lib/
│   │   ├── ai/           # AI integration (generate, grade, test creation)
│   │   ├── auth.ts       # Authentication helpers
│   │   ├── utils.ts      # Utility functions
│   │   └── constants.ts  # App constants
│   └── hooks/            # Custom React hooks
├── convex/
│   ├── schema.ts         # Database schema
│   ├── projects/         # Project queries and mutations
│   ├── fields/           # Field management
│   ├── submissions/      # Submission handling
│   ├── responses/        # Response management
│   ├── credits/          # AI credits management
│   ├── ai/               # AI actions (generate, grade)
│   ├── billing.ts        # Billing integration
│   └── http.ts           # Webhook handlers
├── public/               # Static assets (logos, images)
├── e2e/                  # Playwright E2E tests
├── scripts/              # Build and deployment scripts
├── DEPLOYMENT.md         # Comprehensive deployment guide
└── TODO.md               # Complete implementation plan
```

## Key Dependencies

- `react` & `react-dom` v19 - Latest React
- `react-router` v7 - Full-stack React framework
- `@clerk/react-router` - Authentication
- `convex` - Real-time database
- `@polar-sh/sdk` & `@convex-dev/polar` - Subscription management
- `@ai-sdk/openai` & `ai` - Vercel AI SDK for AI integration via Vercel AI Gateway
- `@dnd-kit/*` - Drag-and-drop functionality
- `@vercel/react-router` - Vercel deployment
- `tailwindcss` v4 - Styling
- `@radix-ui/*` - UI primitives

## Scripts

**Development:**
- `npm run dev` - Start development server with HMR
- `npm run typecheck` - Run TypeScript type checking

**Build:**
- `npm run build` - Build for production
- `npm run start` - Start production server

**Testing:**
- `npm test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Run tests with Vitest UI
- `npm run test:e2e` - Run E2E tests with Playwright
- `npm run test:e2e:ui` - Run E2E tests with Playwright UI
- `npm run test:perf` - Run performance tests (bundle size check)

**Deployment:**
- `npx tsx scripts/production-checklist.ts` - Run production readiness checks

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Comprehensive deployment guide
- **[TODO.md](./TODO.md)** - Complete implementation plan with all phases
- **[app/lib/AUTH.md](./app/lib/AUTH.md)** - Authentication flow documentation

## Performance

- **Lighthouse Score:** > 90
- **Bundle Size:** Monitored and optimized
- **Test Coverage:** 170+ unit tests across utilities, AI functions, and components
- **E2E Testing:** Playwright test suite for critical user flows

## Support

For issues or questions:
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment troubleshooting
- Review [TODO.md](./TODO.md) for implementation details
- Check Convex Dashboard for backend logs
- Monitor Vercel Dashboard for frontend analytics

---

**xam by superlearn** - AI-powered test creation made simple.

Built with React Router v7, Convex, Clerk, Polar.sh, and Vercel AI Gateway.