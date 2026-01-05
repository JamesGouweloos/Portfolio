# Firebase Deployment Guide

## Overview

This project will be deployed to Firebase Hosting as part of a portfolio showcase. Firebase Hosting works well with Next.js, but there are some important considerations.

## Important Notes

### PostgreSQL on Firebase
Firebase doesn't have native PostgreSQL support. You have a few options:

1. **Google Cloud SQL (PostgreSQL)** - Recommended
   - Managed PostgreSQL service
   - Works seamlessly with Firebase/Google Cloud
   - Can be accessed from Firebase Functions or directly from Next.js

2. **Supabase** - Alternative
   - PostgreSQL with Firebase-like features
   - Good free tier
   - Easy to set up

3. **Firebase Extensions**
   - Some extensions provide database connectivity
   - Check Firebase Extensions marketplace

## Recommended Approach

### Phase 1: Local Development (Current)
✅ **Do this first:**
- Develop and test locally
- Use local PostgreSQL for development
- Generate and test data locally
- Ensure all features work

### Phase 2: Portfolio Structure Setup
Set up a portfolio structure that can host multiple projects:

```
Portfolio/
├── app/                    # Next.js app (portfolio + projects)
│   ├── (portfolio)/        # Portfolio pages
│   │   ├── page.tsx        # Home page
│   │   ├── about/
│   │   └── projects/
│   ├── projects/           # Project showcases
│   │   ├── hotel-dashboard/
│   │   │   └── page.tsx    # Hotel Dashboard showcase
│   │   └── [other-projects]/
│   └── api/                # API routes
├── components/
│   ├── portfolio/          # Portfolio components
│   └── projects/           # Project-specific components
│       └── hotel-dashboard/
├── Hotel_Dashboard/        # Current project (can be moved)
└── [other-projects]/
```

### Phase 3: Firebase Configuration
When ready to deploy:

1. **Firebase Hosting Setup**
   - Next.js needs to be built as static export OR
   - Use Firebase Functions for server-side rendering
   - Or use Vercel (better Next.js support) and link to portfolio

2. **Database Configuration**
   - Set up Google Cloud SQL PostgreSQL
   - Use environment variables for connection
   - Consider connection pooling for serverless

## Deployment Options

### Option A: Firebase Hosting (Static Export)
- Export Next.js as static site
- API routes won't work (need Firebase Functions)
- Simpler setup

### Option B: Firebase Functions + Hosting
- Full Next.js support with SSR
- API routes work via Functions
- More complex setup

### Option C: Vercel (Recommended for Next.js)
- Best Next.js support
- Easy deployment
- Can be part of portfolio if you use subdomain

### Option D: Hybrid Approach
- Portfolio on Firebase Hosting
- Projects on Vercel/Netlify
- Link projects from portfolio

## Next Steps

1. **Continue local development** ✅ (You're here)
2. **Set up portfolio structure** (When ready)
3. **Configure Firebase/Cloud SQL** (Before deployment)
4. **Test deployment locally** (Firebase emulators)
5. **Deploy to production**

## Environment Variables for Firebase

You'll need to set these in Firebase:

```env
# Database (Google Cloud SQL)
DB_HOST=your-cloud-sql-ip
DB_NAME=hotel_analytics
DB_USER=your-user
DB_PASSWORD=your-password
DB_PORT=5432

# Next.js
NEXT_PUBLIC_APP_URL=https://your-portfolio.web.app
```

## Recommendation

**Start local, deploy when ready.** This gives you:
- Better development experience
- Ability to test everything thoroughly
- Flexibility to change structure
- Easier debugging

When you're ready to deploy, we can:
1. Set up the portfolio structure
2. Configure Firebase/Cloud SQL
3. Create deployment scripts
4. Set up CI/CD if needed


