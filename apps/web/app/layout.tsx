import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const APP_URL = process.env.BETTER_AUTH_URL ?? "https://gradifyhub.com";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "GradifyHub — From zero to hired, with proof.",
  description: "AI-powered career acceleration for AI Engineers.",
  metadataBase: new URL(APP_URL),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
