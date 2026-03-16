import { Head } from 'nextra/components'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import themeConfig from '../theme.config'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
