import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CMS POC',
  description: 'Next.js + Storyblok POC',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
