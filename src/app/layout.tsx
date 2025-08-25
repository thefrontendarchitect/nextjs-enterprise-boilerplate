import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { getLocale, getTranslations } from "@/shared/lib/i18n/server";
import { SkipNav } from "@/shared/components/skip-nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Frontend Boilerplate",
  description: "Production-ready Next.js boilerplate",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getTranslations();
  
  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SkipNav />
        <Providers locale={locale} messages={messages}>
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
