#!/bin/bash

echo "🚀 Deploying CV ATS Checker to GitHub Pages..."

# Build the application
echo "📦 Building the application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Commit and push changes
    echo "📝 Committing changes..."
    git add .
    git commit -m "Deploy to GitHub Pages: $(date)"
    
    echo "🚀 Pushing to GitHub..."
    git push origin main
    
    echo "🎉 Deployment initiated!"
    echo "📱 Your app will be available at: https://gourav8jain.github.io/cv-ats-checker"
    echo "⏳ Wait 5-10 minutes for the GitHub Actions workflow to complete."
    echo ""
    echo "🔍 To check deployment status:"
    echo "   1. Go to: https://github.com/gourav8jain/cv-ats-checker/actions"
    echo "   2. Look for 'Deploy to GitHub Pages' workflow"
    echo "   3. Wait for it to complete (green checkmark)"
    echo ""
    echo "🌐 After deployment, enable GitHub Pages:"
    echo "   1. Go to repository Settings → Pages"
    echo "   2. Source: 'GitHub Actions'"
else
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi 