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
        <link rel="icon" href="https://cdn.shopify.com/s/files/1/0866/1241/0648/files/Favicon.png?v=1769592249" type="image/png" />
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
