"use client";

import { ConfigProvider } from "./configContext"; // Adjust path as needed
import { ReactNode } from "react";
import "./globals.css"; // Ensure global styles are applied
import { HomeProvider } from "./homeContext";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Icon assets links */}
        <link
          rel="apple-touch-icon"
          sizes="57x57"
          href="assets/apple-icon-57x57.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="60x60"
          href="assets/apple-icon-60x60.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="72x72"
          href="assets/apple-icon-72x72.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="76x76"
          href="assets/apple-icon-76x76.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="114x114"
          href="assets/apple-icon-114x114.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="120x120"
          href="assets/apple-icon-120x120.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="144x144"
          href="assets/apple-icon-144x144.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="assets/apple-icon-152x152.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="assets/apple-icon-180x180.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="assets/android-icon-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="assets/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="96x96"
          href="assets/favicon-96x96.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="assets/favicon-16x16.png"
        />
        <link rel="assets/manifest" href="/manifest.json" />
        <meta name="assets/msapplication-TileColor" content="#ffffff" />
        <meta name="assets/msapplication-TileImage" content="/ms-icon-144x144.png" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className="min-h-screen bg-background dark:bg-background text-gray-900 dark:text-gray-100 font-sans">
        <HomeProvider>
          <ConfigProvider>
            <main className="container mx-auto px-4 py-6">{children}</main>
          </ConfigProvider>
        </HomeProvider>
      </body>
    </html>
  );
}
