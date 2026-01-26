/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export configuration
  // output: 'export',
  
  // Disable image optimization for static export (keep for compatibility)
  images: {
    unoptimized: true
  },
  
  // Disable trailing slash for better compatibility
  trailingSlash: false,
  
  // Removed i18n config to avoid conflicts with custom language implementation
}

module.exports = nextConfig