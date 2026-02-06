import type React from "react";
import type { Metadata, Viewport } from "next";
import { Nunito, Space_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { LanguageProvider } from "@/components/language-provider";
import { FreighterProvider } from "@/components/freighter-provider";

const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });
const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
});

export const metadata: Metadata = {
  title: "Shimeji Factory | Open Your Intergalactic Portal",
  description:
    "Open an intergalactic portal, set an intention, and welcome a playful shimeji companion that follows you across the web.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/logo.png",
        type: "image/png",
      },
    ],
    apple: "/logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#e8e4f0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${nunito.variable} ${spaceMono.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <FreighterProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </FreighterProvider>
        <Analytics />
      </body>
    </html>
  );
}
