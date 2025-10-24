/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export configuration
  output: 'export',
  
  // Disable image optimization for static export
  images: {
    unoptimized: true
  },
  
  // Disable trailing slash for better compatibility
  trailingSlash: false,
  
  // Disable server-side features for static export
  distDir: 'out',
  
  // Removed i18n config to avoid conflicts with custom language implementation
}

module.exports = nextConfig