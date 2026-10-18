import type { Metadata } from "next";
import { Bowlby_One, Geist_Mono, Inter } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

// Display face (stand-in for Lateral 800) and UI face (stand-in for Aeonik Pro).
const bowlby = Bowlby_One({
  variable: "--font-bowlby",
  subsets: ["latin"],
  weight: "400",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Realtime Board",
  description: "A collaborative Kanban board with live updates, built with Next.js, NestJS, PostgreSQL and WebSockets.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${bowlby.variable} ${inter.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
