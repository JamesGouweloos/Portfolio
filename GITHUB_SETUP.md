# GitHub Setup Guide

## ✅ Monorepo Structure Created

Your portfolio monorepo is now set up:

```
Portfolio/
├── apps/
│   ├── portfolio/          # Main portfolio website (Next.js)
│   └── hotel-dashboard/   # Hotel Booking Analytics Dashboard
├── .gitignore
├── README.md
├── package.json
├── firebase.json
└── .firebaserc
```

## Git Repository Status

✅ Git repository initialized
✅ Files staged and ready to commit

## Next Steps: Push to GitHub

### Step 1: Configure Git (One-time setup)

If you haven't configured git globally, run:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

Or for this repository only:

```bash
cd C:\Portfolio
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### Step 2: Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Repository name: `portfolio` (or your preferred name)
3. Description: "Portfolio monorepo showcasing projects"
4. Choose Public or Private
5. **Don't** initialize with README, .gitignore, or license
6. Click "Create repository"

### Step 3: Add Remote and Push

After creating the repository, GitHub will show you commands. Use these:

```bash
cd C:\Portfolio

# Add your GitHub repository as remote
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/portfolio.git

# Create initial commit
git commit -m "Initial commit: Portfolio monorepo with Hotel Dashboard"

# Set main branch and push
git branch -M main
git push -u origin main
```

### Step 4: Verify

Check your GitHub repository - all files should be there!

## Repository Structure on GitHub

Your repository will show:
- Root README.md
- apps/portfolio/ - Portfolio website
- apps/hotel-dashboard/ - Hotel Dashboard project
- Configuration files (firebase.json, package.json, etc.)

## Next: Firebase Deployment

After pushing to GitHub:

1. **Update .firebaserc** with your Firebase project ID
2. **Set up Firebase project** in Firebase Console
3. **Configure environment variables** in Firebase
4. **Deploy portfolio**: `firebase deploy --only hosting`

## Notes

- The old `Hotel_Dashboard/` folder still exists locally but is gitignored
- You can delete it after verifying everything works
- Environment variables (`.env`) are gitignored - set them in Firebase Console
- Generated data files are gitignored - they'll be generated in production

## Troubleshooting

**If push fails:**
- Check your GitHub credentials
- Verify the repository URL is correct
- Make sure you have write access to the repository

**If you need to update .firebaserc:**
```bash
# Edit .firebaserc and replace "your-firebase-project-id" with your actual project ID
```
