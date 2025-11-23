/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use dynamic rendering to support backend API
  // output: 'export', // Commented out to allow dynamic routes
  
  // Disable image optimization for static export (keep for compatibility)
  images: {
    unoptimized: true
  },
  
  // Disable trailing slash for better compatibility
  trailingSlash: false,
  
  // Removed i18n config to avoid conflicts with custom language implementation
}

module.exports = nextConfig