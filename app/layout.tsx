import { Head } from 'nextra/components'
import type { Metadata } from 'next'
import themeConfig from '../theme.config'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Keel Docs',
    template: '%s | Keel Docs'
  },
  description:
    'Keel documentation — policy enforcement and execution governance for AI systems.'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Head>{themeConfig.head}</Head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
