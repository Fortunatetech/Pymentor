import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PyMentor AI - Learn Python with Your AI Tutor',
  description: 'A patient, personalized AI tutor that remembers your journey and helps you become a confident Python developer.',
  keywords: ['python', 'programming', 'learn python', 'ai tutor', 'coding'],
  authors: [{ name: 'PyMentor AI' }],
  openGraph: {
    title: 'PyMentor AI - Learn Python with Your AI Tutor',
    description: 'A patient, personalized AI tutor that remembers your journey.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-dark-50">
        {children}
      </body>
    </html>
  );
}
