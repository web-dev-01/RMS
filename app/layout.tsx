import '../styles/globals.css';
import { Inter } from 'next/font/google';
import { ThemeWrapper } from '@/components/ThemeProvider';
import { UserProvider } from '@/contexts/UserContext';
import Navbar from '@/components/Navbar'; // ← Your landing page navbar

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata = {
  title: 'YourCompany SaaS Landing',
  description: 'Clean SaaS marketing site',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeWrapper>
          <UserProvider>
            <Navbar />
            {children}
          </UserProvider>
        </ThemeWrapper>
      </body>
    </html>
  );
}
