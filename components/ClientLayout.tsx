'use client'

import { useLanguage } from '@/lib/LanguageContext'
import { useAuth } from '@/lib/AuthContext'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import HomePageSkeleton from '@/components/HomePageSkeleton'
import ProjectsPageSkeleton from '@/components/ProjectsPageSkeleton'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

function Navbar() {
  const { t, isHydrated } = useLanguage()
  const { user, signOut, isAuthenticated } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const profileDropdownRef = useRef<HTMLDivElement>(null)

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false)
      }
    }
    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isProfileDropdownOpen])
  
  // Don't render until hydrated to prevent flash
  if (!isHydrated) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="h-6 w-32 bg-gray-200 animate-pulse rounded"></div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-4 w-16 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      </nav>
    )
  }
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900 hover:text-theme-primary transition-colors duration-200 flex items-center gap-2">
              <span>{t('nav.title')}</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Home */}
            <Link href="/" className="text-gray-700 hover:text-theme-primary hover:bg-theme-primary-light px-3 py-2 rounded-md text-sm font-medium transition-all duration-200">
              {t('nav.home')}
            </Link>
            
            {/* Projects */}
            <Link href="/projects" className="text-gray-700 hover:text-theme-primary hover:bg-theme-primary-light px-3 py-2 rounded-md text-sm font-medium transition-all duration-200">
              {t('nav.projects')}
            </Link>
            
            {/* About PPP */}
            <Link href="/about" className="text-gray-700 hover:text-theme-primary hover:bg-theme-primary-light px-3 py-2 rounded-md text-sm font-medium transition-all duration-200">
              {t('nav.aboutPPP')}
            </Link>
            
            {/* Profile Icon (when authenticated) */}
            {isAuthenticated ? (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-theme-primary text-white hover:bg-theme-primary-dark transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-theme-primary focus:ring-offset-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
                
                {/* Profile Dropdown */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                    </div>
                    
                    {/* Language Switcher */}
                    <div className="px-4 py-2 border-b border-gray-200">
                      <LanguageSwitcher />
                    </div>
                    
                    {/* Sign Out */}
                    <button
                      onClick={() => {
                        signOut()
                        setIsProfileDropdownOpen(false)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    >
                      {t('nav.signOut')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/signin" className="bg-theme-primary hover:bg-theme-primary-dark text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200">
                {t('nav.signIn')}
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-gray-900 p-2 rounded-md"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              {/* Home */}
              <Link 
                href="/" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('nav.home')}
              </Link>
              
              {/* Projects */}
              <Link 
                href="/projects" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('nav.projects')}
              </Link>
              
              {/* About PPP */}
              <Link 
                href="/about" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('nav.aboutPPP')}
              </Link>
              
              {/* Auth Section */}
              {isAuthenticated ? (
                <div className="px-3 py-2 border-t border-gray-200 space-y-2">
                  {/* User Info */}
                  <div className="py-2">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                  
                  {/* Language Switcher */}
                  <div className="py-2">
                    <LanguageSwitcher />
                  </div>
                  
                  {/* Sign Out */}
                  <button
                    onClick={() => {
                      signOut()
                      setIsMobileMenuOpen(false)
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    {t('nav.signOut')}
                  </button>
                </div>
              ) : (
                <Link 
                  href="/signin" 
                  className="block px-3 py-2 rounded-md text-base font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('nav.signIn')}
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

function Footer() {
  const { t } = useLanguage()
  
  return (
    <footer className="bg-gray-800 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Main Info */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">
              {t('footer.platformName')}
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {t('footer.description')}
            </p>
          </div>
          
          {/* Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">{t('footer.links')}</h4>
            <div className="space-y-2">
              <a href="/" className="block text-gray-300 hover:text-theme-primary transition-colors duration-200 text-sm">{t('footer.home')}</a>
              <a href="/dashboard" className="block text-gray-300 hover:text-theme-primary transition-colors duration-200 text-sm">{t('footer.dashboard')}</a>
              <a href="/projects" className="block text-gray-300 hover:text-theme-primary transition-colors duration-200 text-sm">{t('footer.allProjects')}</a>
              <a href="/about" className="block text-gray-300 hover:text-theme-primary transition-colors duration-200 text-sm">{t('footer.aboutPPP')}</a>
            </div>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">{t('footer.contact')}</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <p>{t('footer.contactDesc')}</p>
              <p className="text-white">{t('footer.email')}</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              {t('footer.copyright')}
            </p>
            <p className="text-gray-500 text-xs mt-2 md:mt-0">
              {t('footer.developer')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

function MainContent({ children }: { children: React.ReactNode }) {
  const { isHydrated } = useLanguage()
  const pathname = usePathname()
  
  if (!isHydrated) {
    // Show page-specific skeleton based on route
    if (pathname === '/') {
      return (
        <main className="flex-1 max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 pt-24">
          <HomePageSkeleton />
        </main>
      )
    }
    
    if (pathname === '/projects') {
      return (
        <main className="flex-1 max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 pt-24">
          <ProjectsPageSkeleton />
        </main>
      )
    }
    
    // Generic skeleton for other pages
    return (
      <main className="flex-1 max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 pt-24">
        <div className="space-y-4">
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-4 w-96 bg-gray-200 animate-pulse rounded"></div>
          <div className="grid gap-4 mt-8">
            <div className="h-32 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-32 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </div>
      </main>
    )
  }
  
  return (
    <main className="flex-1 max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 pt-24">
      {children}
    </main>
  )
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <MainContent>{children}</MainContent>
      <Footer />
    </div>
  )
}

