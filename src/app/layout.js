import { AuthProvider } from '../lib/firebase';
import './globals.css';
import './light-theme.css';

export const metadata = {
  title: 'Parsley | AI Traffic Analytics',
  description: 'Track and analyze traffic from AI platforms to your website',
  metadataBase: new URL('https://www.parsley.ai'),
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.parsley.ai',
    siteName: 'Parsley Analytics',
    title: 'Parsley | AI Traffic Analytics',
    description: 'Track and analyze traffic from AI platforms to your website',
    images: [
      {
        url: 'https://i.imgur.com/CoTyX6K.png',
        width: 1200,
        height: 630,
        alt: 'Parsley Analytics'
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@parsleyanalytics',
    title: 'Parsley | AI Traffic Analytics',
    description: 'Track and analyze traffic from AI platforms to your website',
    images: [
      {
        url: 'https://i.imgur.com/CoTyX6K.png',
        alt: 'Parsley Analytics'
      }
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" style={{ backgroundColor: 'white', color: '#1f2937' }}>
      <body className="bg-white text-gray-900" style={{ backgroundColor: 'white !important', color: '#1f2937 !important' }}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}