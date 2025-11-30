import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LEGG Production Schedule',
  description: 'Production scheduling and job management',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
