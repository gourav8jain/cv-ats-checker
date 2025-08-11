#!/bin/bash

echo "🚀 Starting deployment process..."

# Build the application
echo "📦 Building the application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Commit and push changes
    echo "📝 Committing changes..."
    git add .
    git commit -m "Auto-deploy: $(date)"
    
    echo "🚀 Pushing to GitHub..."
    git push origin main
    
    echo "🎉 Deployment initiated!"
    echo "📱 Your app will be available at: https://gourav8jain.github.io/cv-ats-checker"
    echo "⏳ It may take a few minutes for changes to appear."
else
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi 