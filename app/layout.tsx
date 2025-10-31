import '../styles/globals.css'
import { Prompt } from 'next/font/google'
import { LanguageProvider } from '@/lib/LanguageContext'
import { AuthProvider } from '@/lib/AuthContext'
import ClientLayout from '@/components/ClientLayout'

const prompt = Prompt({ 
  subsets: ['latin', 'thai'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-prompt',
})

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
