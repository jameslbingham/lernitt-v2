// @ts-nocheck
import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

/**
 * LERNITT-V2 GLOBAL LAYOUT (Merged)
 * Injects the Daily.co Video SDK and standardizes site metadata.
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
        {/* italki-standard: Ensuring the Video Engine is loaded globally 
            so Alice or Bob can enter live rooms without latency. 
            */}
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
