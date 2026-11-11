import type { Metadata } from 'next';
import './globals.css';
import { DashboardShell } from '@/components/layout/DashboardShell';

export const metadata: Metadata = {
  title: 'PostCraft AI | Free AI Image Studio & Social Publisher',
  description:
    'Free, unlimited, watermark-free AI image generation with automated scheduling and Pinterest publishing from prompts and Google Sheets.',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen antialiased selection:bg-brand-500/30 selection:text-white">
        <DashboardShell>{children}</DashboardShell>
      </body>
    </html>
  );
}
