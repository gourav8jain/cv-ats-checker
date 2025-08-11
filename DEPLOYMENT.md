# 🚀 GitHub Pages Deployment Guide

## 📋 Prerequisites

1. **GitHub Account**: You need a GitHub account
2. **Personal Access Token**: Required for authentication

## 🔐 Step 1: Create Personal Access Token

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a name: `CV ATS Checker Deploy`
4. Select these scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
   - ✅ `admin:org` (Full control of organizations and teams)
5. Click "Generate token"
6. **Copy the token** and save it securely

## 🚀 Step 2: Deploy to GitHub Pages

### Option A: Automatic Deployment (Recommended)

1. **Push your code** (you'll be prompted for username and token):
   ```bash
   git push origin main
   ```
   - Username: `gourav8jain`
   - Password: Use your Personal Access Token

2. **Enable GitHub Pages**:
   - Go to your repository: https://github.com/gourav8jain/cv-ats-checker
   - Click "Settings" tab
   - Scroll down to "Pages" section
   - Under "Source", select "Deploy from a branch"
   - Choose "gh-pages" branch
   - Click "Save"

3. **Set up GitHub Secrets** (for automatic deployment):
   - Go to repository "Settings" > "Secrets and variables" > "Actions"
   - Click "New repository secret"
   - Name: `REACT_APP_GEMINI_API_KEY`
   - Value: Your Gemini API key
   - Click "Add secret"

### Option B: Manual Deployment

1. **Run the deployment script**:
   ```bash
   ./deploy.sh
   ```

2. **Or manually**:
   ```bash
   npm run build
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

## 🌐 Step 3: Access Your App

Your app will be available at:
**https://gourav8jain.github.io/cv-ats-checker**

## ⚙️ Configuration Files

- **`.github/workflows/deploy.yml`**: GitHub Actions workflow
- **`package.json`**: Contains homepage URL
- **`deploy.sh`**: Manual deployment script

## 🔄 Automatic Deployment

Every time you push to the `main` branch, GitHub Actions will:
1. Build your React app
2. Deploy to GitHub Pages
3. Update the live site

## 🚨 Troubleshooting

### Authentication Issues
- Make sure you're using the Personal Access Token, not your password
- Token should have the required scopes

### Build Failures
- Check the GitHub Actions tab for error details
- Ensure all dependencies are properly installed

### Page Not Loading
- Wait 5-10 minutes after deployment
- Check if the gh-pages branch was created
- Verify GitHub Pages is enabled in repository settings

## 📱 Features Deployed

✅ **PDF Processing**: Robust PDF text extraction  
✅ **Word Document Support**: .docx and .doc files  
✅ **AI Integration**: Gemini 2.5 API for ATS analysis  
✅ **Responsive Design**: Works on all devices  
✅ **Error Handling**: Comprehensive error messages  
✅ **User Experience**: Beautiful UI with loading states  

## 🎯 Next Steps

1. **Test the deployed app** at the GitHub Pages URL
2. **Monitor deployments** in the Actions tab
3. **Update your API key** in GitHub Secrets if needed
4. **Share the live URL** with others

---

**Need Help?** Check the GitHub Actions tab in your repository for deployment logs and error details. 