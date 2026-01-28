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
        <link rel="icon" href="data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3ctext y='.9em' font-size='90' font-family='sans-serif' fill='hsl(345 86% 55%)'%3eK%3c/text%3e%3c/svg%3e" type="image/svg+xml" />
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
