# Push to GitHub - Quick Guide

## ✅ Ready to Push!

Your repository is committed and ready. Now you need to:

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `portfolio` (or your preferred name)
3. Description: "Portfolio monorepo showcasing projects"
4. Choose **Public** or **Private**
5. **DO NOT** check "Initialize with README" (we already have files)
6. Click **"Create repository"**

### Step 2: Add Remote and Push

After creating the repository, GitHub will show you commands. Use these:

**Replace `YOUR_USERNAME` with your actual GitHub username:**

```bash
cd C:\Portfolio

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/portfolio.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Alternative: If Repository Already Exists

If you already created the repository, just run:

```bash
cd C:\Portfolio
git remote add origin https://github.com/YOUR_USERNAME/portfolio.git
git branch -M main
git push -u origin main
```

### What's Being Pushed

- ✅ Portfolio monorepo structure
- ✅ Hotel Dashboard (complete analytics app)
- ✅ Portfolio app (basic Next.js structure)
- ✅ Firebase configuration
- ✅ All documentation

### After Pushing

1. Verify files appear on GitHub
2. Update `.firebaserc` with your Firebase project ID
3. Set up Firebase deployment
4. Configure environment variables in Firebase Console

## Need Help?

If you encounter authentication issues:
- Use GitHub CLI: `gh auth login`
- Or use SSH: `git remote set-url origin git@github.com:YOUR_USERNAME/portfolio.git`

