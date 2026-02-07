import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/components/providers/user-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pymentor.ai";

export const metadata: Metadata = {
  title: {
    default: "PyMentor AI - Learn Python with an AI Tutor That Remembers You",
    template: "%s | PyMentor AI",
  },
  description:
    "A patient, personalized AI tutor that adapts to your pace, celebrates your wins, and guides you from zero to Python developer.",
  keywords: [
    "python",
    "learn python",
    "ai tutor",
    "coding",
    "programming",
    "education",
    "python course",
    "learn to code",
  ],
  metadataBase: new URL(appUrl),
  openGraph: {
    title: "PyMentor AI - Learn Python with an AI Tutor That Remembers You",
    description:
      "A patient, personalized AI tutor that adapts to your pace, celebrates your wins, and guides you from zero to Python developer.",
    url: appUrl,
    siteName: "PyMentor AI",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "PyMentor AI - Learn Python with an AI Tutor",
    description:
      "A patient, personalized AI tutor that adapts to your pace and guides you from zero to Python developer.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-dark-50">
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
