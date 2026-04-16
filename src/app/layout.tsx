import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Space Grotesk loaded via @import in globals.css for full weight control
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const appName = process.env.NEXT_PUBLIC_APP_NAME ?? 'LotLeads';

export const metadata: Metadata = {
  title: {
    default: `${appName} — AI Parking Lot Intelligence for Paving Contractors`,
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
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="dark" />
      </head>
      <body className={`${inter.variable} bg-base text-ink antialiased`}>
        {children}
      </body>
    </html>
  );
}
