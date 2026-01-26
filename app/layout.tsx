import '../styles/globals.css'
import { LanguageProvider } from '@/lib/LanguageContext'
import { AuthProvider } from '@/lib/AuthContext'
import { ThemeProvider } from '@/lib/ThemeContext'
import ClientLayout from '@/components/ClientLayout'
import ReduxProvider from '@/components/ReduxProvider'
import QueryClientProvider from '@/components/QueryClientProvider'
import type { Metadata } from 'next'

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
      <body>
        <QueryClientProvider>
          <ReduxProvider>
            <ThemeProvider>
              <LanguageProvider>
                <AuthProvider>
                  <ClientLayout>{children}</ClientLayout>
                </AuthProvider>
              </LanguageProvider>
            </ThemeProvider>
          </ReduxProvider>
        </QueryClientProvider>
      </body>
    </html>
  )
}
