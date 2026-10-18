import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import ChromeGate from "@/components/layout/ChromeGate";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#2e7d32" };

export const metadata: Metadata = {
  title: {
    default: "Harvest Club | Agritech Innovation",
    template: "%s | Harvest Club",
  },
  description:
    "Harvest Club is a student community advancing agritech innovation through events, workshops, hackathons and industry partnerships.",
  icons: { icon: "/logo.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:shadow-lg"
        >
          Skip to content
        </a>
        <ChromeGate><Navbar /></ChromeGate>
        <main id="main" className="flex flex-grow flex-col">
          {children}
        </main>
        <ChromeGate><Footer /></ChromeGate>
      </body>
    </html>
  );
}
