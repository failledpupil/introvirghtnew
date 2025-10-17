#!/bin/bash

# Introvirght Deployment Script
echo "🚀 Deploying Introvirght to production..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please create .env file with your credentials:"
    echo "VITE_ASTRA_DB_TOKEN=your_token_here"
    echo "VITE_ASTRA_DB_ENDPOINT=your_endpoint_here"
    echo "VITE_OPENAI_API_KEY=your_key_here"
    exit 1
fi

# Build the project
echo "📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo "🎉 Deployment successful!"
    echo "Your Introvirght app is now live!"
else
    echo "❌ Deployment failed!"
    exit 1
fi