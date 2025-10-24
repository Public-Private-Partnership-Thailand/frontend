# Static Web App Deployment Guide

## Overview
This PPP project is now configured as a **static web application** that fetches data from an external JSON API. It can be deployed to any static hosting service.

## Data Source
- **API URL**: `https://publicdigitaltwin.s3.ap-southeast-1.amazonaws.com/project-ppp.json`
- **Data Format**: Thai PPP project data with fields like โครงการ, กลุ่มกิจการ, etc.
- **Real-time**: Data is fetched from the external API on each page load

## Deployment Options

### Option 1: AWS S3 + CloudFront (Recommended)
1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Upload to S3**:
   - Upload the contents of the `out/` folder to an S3 bucket
   - Enable static website hosting
   - Set index.html as the index document

3. **Configure CloudFront** (optional):
   - Create a CloudFront distribution
   - Point to your S3 bucket
   - Enable HTTPS and custom domain

### Option 2: Vercel (Easiest)
1. **Connect your repository** to Vercel
2. **Deploy automatically** - Vercel will detect Next.js and build it
3. **Custom domain** (optional)

### Option 3: Netlify
1. **Build command**: `npm run build`
2. **Publish directory**: `out`
3. **Deploy** from Git or drag & drop

### Option 4: GitHub Pages
1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Upload to GitHub Pages**:
   - Upload the contents of the `out/` folder to your repository
   - Enable GitHub Pages in repository settings

## Build Process
```bash
# Install dependencies
npm install

# Build for static export
npm run build

# The built files will be in the 'out' directory
```

## Project Structure After Build
```
out/
├── index.html
├── _next/
│   ├── static/
│   └── ...
├── view/
│   └── [id]/
├── edit/
│   └── [id]/
├── create/
└── ...
```

## Key Features
- **Static Export**: No server required
- **External API**: Fetches data from S3 JSON file
- **Client-side Routing**: Uses Next.js router
- **Responsive Design**: Works on all devices
- **Thai Language Support**: Full Thai language interface

## Environment Variables
No environment variables needed for static deployment.

## Performance
- **Fast Loading**: Static files served from CDN
- **SEO Friendly**: Pre-rendered HTML pages
- **Offline Capable**: Can work offline (with cached data)

## Troubleshooting

### Common Issues:
1. **Build Failures**: Check that all dependencies are installed
2. **API Errors**: Verify the external JSON API is accessible
3. **Routing Issues**: Ensure your hosting service supports client-side routing

### API Endpoint:
- **URL**: `https://publicdigitaltwin.s3.ap-southeast-1.amazonaws.com/project-ppp.json`
- **Format**: Array of Thai PPP project objects
- **CORS**: Must be enabled for browser access
