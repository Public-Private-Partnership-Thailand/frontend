import '../styles/globals.css'
import { Prompt } from 'next/font/google'
import { LanguageProvider } from '@/lib/LanguageContext'
import { AuthProvider } from '@/lib/AuthContext'
import ClientLayout from '@/components/ClientLayout'
import type { Metadata } from 'next'

const prompt = Prompt({ 
  subsets: ['latin', 'thai'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-prompt',
})

export const metadata: Metadata = {
  title: 'Thailand PPP Platform | แพลตฟอร์มโครงการร่วมลงทุนระหว่างรัฐและเอกชน',
  description: 'Platform for Thailand\'s Public-Private Partnership project information and data management.',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body className={prompt.variable}>
        <LanguageProvider>
          <AuthProvider>
            <ClientLayout>{children}</ClientLayout>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
