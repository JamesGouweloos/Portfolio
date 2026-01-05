# Firebase Credentials Setup Guide

## Overview

This guide explains how to set up Firebase credentials for your portfolio monorepo.

## Files Created

✅ `.env` - Root environment variables (gitignored)
✅ `.env.example` - Template for root env (committed to git)
✅ `apps/hotel-dashboard/.env` - Hotel Dashboard env (gitignored)
✅ `apps/hotel-dashboard/.env.example` - Template (committed)
✅ `apps/portfolio/.env` - Portfolio app env (gitignored)
✅ `apps/portfolio/.env.example` - Template (committed)

## Firebase Configuration

### 1. Firebase Project ID

**Location:** `.firebaserc` and `.env`

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or select existing)
3. Copy your **Project ID**
4. Update `.firebaserc`:
   ```json
   {
     "projects": {
       "default": "your-actual-project-id"
     }
   }
   ```
5. Update `.env`:
   ```
   FIREBASE_PROJECT_ID=your-actual-project-id
   ```

### 2. Firebase Service Account (Optional - for advanced features)

If you need Firebase Admin SDK or server-side operations:

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save the JSON file securely (DO NOT commit to git)
4. Add to `.env`:
   ```
   FIREBASE_SERVICE_ACCOUNT_KEY=path/to/serviceAccountKey.json
   ```

### 3. Firebase Hosting Configuration

Already configured in `firebase.json`:
- Hosting public directory: `apps/portfolio/out`
- Rewrites configured for SPA routing

## Database Configuration

### For Local Development

Use the `.env` files with local PostgreSQL:
```env
DB_HOST=localhost
DB_NAME=hotel_analytics
DB_USER=postgres
DB_PASSWORD=your-password
DB_PORT=5432
```

### For Production (Google Cloud SQL)

1. Set up Google Cloud SQL PostgreSQL instance
2. Get connection details from Cloud Console
3. Update production `.env`:
```env
DB_HOST=your-cloud-sql-ip
DB_NAME=hotel_analytics
DB_USER=your-db-user
DB_PASSWORD=your-secure-password
DB_PORT=5432
```

### Alternative: Supabase

If using Supabase instead:
```env
DATABASE_URL=postgresql://user:password@host:port/database
```

## Setting Environment Variables in Firebase

For production deployment, set environment variables in Firebase:

### Using Firebase Console

1. Go to Firebase Console → Functions → Configuration
2. Add environment variables:
   - `DB_HOST`
   - `DB_NAME`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_PORT`

### Using Firebase CLI

```bash
firebase functions:config:set db.host="your-host" db.name="hotel_analytics"
```

## Security Best Practices

✅ **DO:**
- Keep `.env` files gitignored
- Use `.env.example` as templates
- Store production secrets in Firebase Console
- Use different credentials for dev/prod

❌ **DON'T:**
- Commit `.env` files to git
- Share credentials in code
- Use production credentials locally
- Hardcode secrets in source code

## Next Steps

1. **Update `.firebaserc`** with your Firebase project ID
2. **Update `.env` files** with your actual credentials
3. **Set up Firebase project** in Firebase Console
4. **Configure production environment** variables in Firebase
5. **Test locally** before deploying

## Verification

After setting up, verify:

```bash
# Check Firebase project
firebase projects:list

# Test database connection (from hotel-dashboard)
cd apps/hotel-dashboard
npm run dev
```

## Troubleshooting

**Firebase not found:**
- Install Firebase CLI: `npm install -g firebase-tools`
- Login: `firebase login`

**Database connection fails:**
- Verify PostgreSQL is running
- Check credentials in `.env`
- Test connection: `psql -h localhost -U postgres -d hotel_analytics`

**Environment variables not loading:**
- Restart Next.js dev server
- Check file is named exactly `.env` (not `.env.local`)
- Verify variables are in correct `.env` file location

