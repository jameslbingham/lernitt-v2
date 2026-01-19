// @ts-nocheck
import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import AppShell from "../components/layout/AppShell";

/**
 * LERNITT-V2 MASTER LAYOUT (Merged)
 * Combines Day 3 Navigation Shell and Day 12 Video Engine.
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
        {/* Day 12: italki Classroom 2.0 Engine */}
        <Script 
          src="https://unpkg.com/@daily-co/daily-js" 
          strategy="beforeInteractive" 
        />
      </head>
      <body className="antialiased">
        {/* Day 3: italki Persistent Design Shell */}
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
