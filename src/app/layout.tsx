import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'R2 Gallery',
  description: 'A minimalist, Apple-inspired web UI to manage a Cloudflare R2 bucket.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`min-h-screen bg-[#F8F9FB] text-gray-900 antialiased ${inter.className}`}>
        {children}
      </body>
    </html>
  );
}
