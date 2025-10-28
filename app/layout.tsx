'use client'

import '../styles/globals.css'
import { Prompt } from 'next/font/google'
import { LanguageProvider } from '@/lib/LanguageContext'
import { AuthProvider } from '@/lib/AuthContext'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useLanguage } from '@/lib/LanguageContext'
import { useAuth } from '@/lib/AuthContext'
import Link from 'next/link'
import { useState } from 'react'

const prompt = Prompt({ 
  subsets: ['latin', 'thai'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-prompt',
})

function Navbar() {
  const { t, isHydrated } = useLanguage()
  const { user, signOut, isAuthenticated } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
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
            <Link href="/" className="text-xl font-bold text-gray-900 hover:text-chula-pink transition-colors duration-200 flex items-center gap-2">
              <span>{t('nav.title')}</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Home */}
            <Link href="/" className="text-gray-700 hover:text-chula-pink hover:bg-chula-pink-lighter px-3 py-2 rounded-md text-sm font-medium transition-all duration-200">
              {t('nav.home')}
            </Link>
            
            {/* Projects Dropdown */}
            <div className="relative group">
              <button className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                {t('nav.projects')}
                <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1">
                  <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    {t('nav.projectsDashboard')}
                  </Link>
                  <Link href="/projects" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    {t('nav.allProjects')}
                  </Link>
                </div>
              </div>
            </div>
            
            {/* About PPP */}
            <Link href="/about" className="text-gray-700 hover:text-chula-pink hover:bg-chula-pink-lighter px-3 py-2 rounded-md text-sm font-medium transition-all duration-200">
              {t('nav.aboutPPP')}
            </Link>
            
            {/* Language Switcher */}
            <LanguageSwitcher />
            
            {/* Auth Section */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{user?.name}</span>
                <button
                  onClick={signOut}
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {t('nav.signOut')}
                </button>
              </div>
            ) : (
              <Link href="/signin" className="bg-chula-pink hover:bg-chula-pink-dark text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200">
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
              <div className="px-3 py-2">
                <div className="text-base font-medium text-gray-700 mb-2">{t('nav.projects')}</div>
                <div className="pl-4 space-y-1">
                  <Link 
                    href="/dashboard" 
                    className="block px-3 py-2 rounded-md text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('nav.projectsDashboard')}
                  </Link>
                  <Link 
                    href="/projects" 
                    className="block px-3 py-2 rounded-md text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('nav.allProjects')}
                  </Link>
                </div>
              </div>
              
              {/* About PPP */}
              <Link 
                href="/about" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('nav.aboutPPP')}
              </Link>
              
              {/* Language Switcher */}
              <div className="px-3 py-2">
                <LanguageSwitcher />
              </div>
              
              {/* Auth Section */}
              {isAuthenticated ? (
                <div className="px-3 py-2 border-t border-gray-200">
                  <div className="text-sm text-gray-600 mb-2">{user?.name}</div>
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
            <h3 className="text-xl font-bold text-chula-pink mb-4">
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
              <a href="/" className="block text-gray-300 hover:text-chula-pink transition-colors duration-200 text-sm">{t('footer.home')}</a>
              <a href="/dashboard" className="block text-gray-300 hover:text-chula-pink transition-colors duration-200 text-sm">{t('footer.dashboard')}</a>
              <a href="/projects" className="block text-gray-300 hover:text-chula-pink transition-colors duration-200 text-sm">{t('footer.allProjects')}</a>
              <a href="/about" className="block text-gray-300 hover:text-chula-pink transition-colors duration-200 text-sm">{t('footer.aboutPPP')}</a>
            </div>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">{t('footer.contact')}</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <p>{t('footer.contactDesc')}</p>
              <p className="text-chula-pink">{t('footer.email')}</p>
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
  
  if (!isHydrated) {
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={prompt.variable}>
        <LanguageProvider>
          <AuthProvider>
            <div className="min-h-screen bg-gray-50 flex flex-col">
              <Navbar />
              <MainContent>{children}</MainContent>
              <Footer />
            </div>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
