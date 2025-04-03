import { AuthProvider } from '../lib/firebase';
import './globals.css';
import './light-theme.css';

export const metadata = {
  title: 'AI Traffic Analytics',
  description: 'Track and analyze traffic from AI platforms to your website',
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