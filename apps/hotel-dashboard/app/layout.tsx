import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Livigno Hotel Analytics Dashboard',
  description: 'Comprehensive booking, revenue, and marketing analytics for Livigno Hotel',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

