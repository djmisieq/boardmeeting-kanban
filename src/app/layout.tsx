import { Inter } from 'next/font/google';
import './globals.css';
import AppLayout from '../components/layout/app-layout';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'BoardMeeting Kanban',
  description: 'Aplikacja do zarządzania spotkaniami i zadaniami zespołowymi',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body className={inter.className}>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
