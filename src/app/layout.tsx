import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

const appName = process.env.NEXT_PUBLIC_APP_NAME ?? 'LotLeads';

export const metadata: Metadata = {
  title: {
    default: `${appName} — Commercial Parking Lot Leads for Paving Contractors`,
    template: `%s | ${appName}`,
  },
  description:
    'AI-powered commercial parking lot lead intelligence. Find deteriorated lots before your competition. Aerial photo evidence + property manager contacts delivered instantly.',
  keywords: ['paving leads', 'parking lot contractor', 'asphalt leads', 'commercial paving', 'striping leads'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: appName,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body className={`${inter.className} bg-white text-gray-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}
