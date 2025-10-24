'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations, Locale, TranslationKeys } from '@/lib/translations'

interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
  isHydrated: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Always start with 'en' to ensure server-client consistency
  const [locale, setLocale] = useState<Locale>('en')
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // After hydration, check for saved locale preference
    const savedLocale = sessionStorage.getItem('locale') as Locale
    if (savedLocale && (savedLocale === 'en' || savedLocale === 'th')) {
      setLocale(savedLocale)
    }
    // Mark as hydrated after first render
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    // Save language preference to sessionStorage only after hydration
    if (isHydrated) {
      sessionStorage.setItem('locale', locale)
    }
  }, [locale, isHydrated])

  const t = (key: string): string => {
    const keys = key.split('.')
    let value: any = translations[locale]
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    return value || key
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, isHydrated }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
