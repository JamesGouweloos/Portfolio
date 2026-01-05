# Environment Variables Setup

## ✅ Created Files

I've created `.env.example` template files for you. Now you need to:

1. **Copy the example files to create your `.env` files**
2. **Fill in your actual credentials**

## Quick Setup

### Root Level (.env)

```bash
cd C:\Portfolio
copy .env.example .env
```

Then edit `.env` and update:
- `FIREBASE_PROJECT_ID` - Your Firebase project ID from Firebase Console

### Hotel Dashboard (.env)

```bash
cd C:\Portfolio\apps\hotel-dashboard
copy .env.example .env
```

Then edit `.env` and update:
- `DB_PASSWORD` - Your PostgreSQL password
- Other database credentials if different from defaults

### Portfolio App (.env)

```bash
cd C:\Portfolio\apps\portfolio
copy .env.example .env
```

Then edit `.env` and update:
- `NEXT_PUBLIC_PORTFOLIO_NAME` - Your name
- `NEXT_PUBLIC_PORTFOLIO_EMAIL` - Your email

## Firebase Project ID

To get your Firebase Project ID:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or select existing)
3. Go to Project Settings (gear icon)
4. Copy the **Project ID**
5. Update `.firebaserc`:
   ```json
   {
     "projects": {
       "default": "your-actual-project-id"
     }
   }
   ```
6. Update root `.env`:
   ```
   FIREBASE_PROJECT_ID=your-actual-project-id
   ```

## Database Credentials

For local development, use your PostgreSQL credentials:
- Default user: `postgres`
- Default port: `5432`
- Update password in `apps/hotel-dashboard/.env`

For production (Google Cloud SQL or Supabase), you'll set these in Firebase Console environment variables.

## Security Notes

✅ `.env` files are gitignored (won't be committed)
✅ `.env.example` files are templates (safe to commit)
✅ Never commit actual `.env` files with real credentials

## Next Steps

1. Copy `.env.example` files to `.env`
2. Fill in your Firebase Project ID
3. Update database credentials
4. Test locally before deploying

See `FIREBASE_CREDENTIALS_SETUP.md` for detailed instructions.

