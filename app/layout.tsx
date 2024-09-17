"use client"; // Add this to make sure it's a client component

import { ReactNode } from 'react';
import { ConfigProvider } from './configContext'; // Import your context provider

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ConfigProvider>
          {children}
        </ConfigProvider>
      </body>
    </html>
  );
}
