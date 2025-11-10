import type { Metadata, Viewport } from "next"
import { GeistSans, GeistMono } from "geist/font"
import "./globals.css"
import { AdminProviders } from "./providers"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Admin Panel - TokenX Ambassador Platform",
  description: "Admin dashboard for managing campaigns, tasks, and ambassadors",
  robots: {
    index: false,
    follow: false,
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
}

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Theme Flash Prevention Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const savedTheme = localStorage.getItem('tokenx-admin-theme') || 'system';
                  const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  const theme = savedTheme === 'system' ? systemPreference : savedTheme;
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {
                  console.error('Theme initialization error:', e);
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AdminProviders>
          {children}
          <Toaster />
        </AdminProviders>
      </body>
    </html>
  )
}
