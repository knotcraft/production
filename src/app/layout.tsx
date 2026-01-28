import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AppShell } from '@/components/layout/app-shell';
import { FirebaseClientProvider } from '@/firebase';

export const metadata: Metadata = {
  title: 'Knotcraft',
  description: 'Your personal wedding planning dashboard.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3cpath fill='hsl(345 86% 55%)' d='M52.8,97.7V97.7c-3.1,0-6.2-1.3-8.4-3.5L8.6,58.4c-2.2-2.2-3.5-5.3-3.5-8.5V4.1c0-2,1.6-3.6,3.6-3.6s3.6,1.6,3.6,3.6v35.8c0,1.2,0.5,2.3,1.3,3.1L52.1,81.4c0.8,0.8,1.9,1.3,3,1.3s2.2-0.5,3-1.3l38.5-38.5c0.8-0.8,1.3-1.9,1.3-3.1V4.1c0-2,1.6-3.6,3.6-3.6s3.6,1.6,3.6,3.6v35.9c0,3.2-1.3,6.2-3.5,8.5L61.2,94.2C59,96.4,56,97.7,52.8,97.7z'%3e%3c/path%3e%3c/svg%3e" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <AppShell>
            {children}
          </AppShell>
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
