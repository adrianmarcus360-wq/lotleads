import type { Metadata } from 'next';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-mono',
  display: 'swap',
});

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
    <html
      lang="en"
      className={`dark ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="color-scheme" content="dark" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
