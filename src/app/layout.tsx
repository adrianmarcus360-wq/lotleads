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
    default: `${appName} \u2014 AI Parking Lot Intelligence for Paving Contractors`,
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
        <footer style={{ background: '#05050F', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '20px 24px', textAlign: 'center' }}>
          <span style={{ fontSize: '13px', color: '#475569' }}>
            &copy; {new Date().getFullYear()} LotLeads
            {' \u00b7 '}
            <a href="/privacy" style={{ color: '#64748b', textDecoration: 'none' }}>Privacy Policy</a>
            {' \u00b7 '}
            <a href="/terms" style={{ color: '#64748b', textDecoration: 'none' }}>Terms of Service</a>
          </span>
        </footer>
      </body>
    </html>
  );
}
