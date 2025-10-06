'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { LenisProvider } from '@/components/LenisProvider';
import { ThemeProvider } from 'next-themes';
import { AudioProvider } from '@/lib/AudioProvider';
import AudioPlayer from '@/components/AudioPlayer';
import { UserProvider } from '@/lib/UserContext';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-[#8c53c9] text-[#F5F5DC]`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <UserProvider>
            <LenisProvider>
              <AudioProvider>
                <main className="min-h-screen">
                  {children}
                </main>
                <AudioPlayer />
              </AudioProvider>
            </LenisProvider>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}