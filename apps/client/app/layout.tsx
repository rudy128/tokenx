import type React from "react"
import type { Metadata, Viewport } from "next"
// @ts-ignore - Geist font imports may have type issues
import { GeistSans, GeistMono } from "geist/font"
import "./globals.css"
import { Providers } from "./providers"
import { Toaster } from "@/components/ui/toaster"
import { InstallPrompt } from "@/components/pwa/install-prompt"
import { OfflineIndicator } from "@/components/ui/offline-indicator"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { auth } from "@/lib/auth"

export const metadata: Metadata = {
  title: "Ambassador Platform - TokenX",
  description: "Campaign & Task Management Platform for Ambassadors",
  generator: "v0.app",
  manifest: "/manifest.json",
  keywords: ["ambassador", "campaign", "task management", "rewards", "blockchain", "social media"],
  authors: [{ name: "TokenX Team" }],
  creator: "TokenX",
  publisher: "TokenX",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://tokenx-ambassador.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Ambassador Platform - TokenX",
    description: "Campaign & Task Management Platform for Ambassadors",
    url: "/",
    siteName: "TokenX Ambassador Platform",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TokenX Ambassador Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ambassador Platform - TokenX",
    description: "Campaign & Task Management Platform for Ambassadors",
    images: ["/og-image.png"],
    creator: "@tokenx",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()



  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Theme Flash Prevention Script - MUST be first */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const savedTheme = localStorage.getItem('tokenx-theme') || 'system';
                  const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  const theme = savedTheme === 'system' ? systemPreference : savedTheme;
                  document.documentElement.setAttribute('data-theme', theme);
                  
                  // Also set class for compatibility if needed
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {
                  // Fallback to light theme if error
                  document.documentElement.setAttribute('data-theme', 'light');
                }
              })();
            `,
          }}
        />
        
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon-16x16.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TokenX" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* CSS Variables Integration */}
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}

/* Enhanced theme transition for better UX */
*, *::before, *::after {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-duration: 0.2s;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Reduce transitions on theme change for performance */
.theme-switching * {
  transition: none !important;
}
        `}</style>
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ErrorBoundary>
          <Providers session={session}>
            {children}
            <Toaster />
            <InstallPrompt />
            <OfflineIndicator />
          </Providers>
        </ErrorBoundary>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}