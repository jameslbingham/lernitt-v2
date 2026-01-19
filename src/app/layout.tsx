// @ts-nocheck
import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

/**
 * LERNITT-V2 GLOBAL LAYOUT
 *
 */

export const metadata: Metadata = {
  title: 'Lernitt - Live Global Marketplace',
  description: 'Sophisticated tutoring platform with live video tools.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* italki-standard: Loading the Video Engine globally 
            to prevent "Daily is not defined" errors during calls. */}
        <Script 
          src="https://unpkg.com/@daily-co/daily-js" 
          strategy="beforeInteractive" 
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
