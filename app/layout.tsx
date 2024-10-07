"use client";

import { ConfigProvider } from './configContext'; // Adjust path as needed
import { ReactNode } from 'react';
import './globals.css'; // Ensure global styles are applied
import { HomeProvider } from './homeContext';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background dark:bg-background text-gray-900 dark:text-gray-100 font-sans">
        <HomeProvider>
          <ConfigProvider>
            <main className="container mx-auto px-4 py-6">
              {children}
            </main>
          </ConfigProvider>
        </HomeProvider>
      </body>
    </html>
  );
}
