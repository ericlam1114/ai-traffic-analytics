import { AuthProvider } from '../lib/firebase';
import './globals.css';
import './light-theme.css';

export const metadata = {
  title: 'Parsley | AI Traffic Analytics',
  description: 'Track and analyze traffic from AI platforms to your website',
  openGraph: {
    images: 'https://i.imgur.com/tVdstfD.png',
  },
  twitter: {
    card: 'summary_large_image',
    images: 'https://i.imgur.com/tVdstfD.png',
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