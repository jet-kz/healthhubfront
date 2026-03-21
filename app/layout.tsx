import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";
import PWAInstallPrompt from "@/components/pwa-install-prompt";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "JetCare Health",
  description: "The complete health ecosystem super-app.",
  manifest: "/manifest.webmanifest",
  themeColor: "#0ea5e9",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "JetCare",
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <Providers>
          {children}
          <PWAInstallPrompt />
        </Providers>
        
        {/* Service Worker Registration */}
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js').then(function(registration) {
                console.log('SW registered: ', registration);
              }, function(err) {
                console.log('SW registration failed: ', err);
              });
            });
          }
        `}} />
      </body>
    </html>
  );
}
