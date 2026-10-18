import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import ChromeGate from "@/components/layout/ChromeGate";
import MaintenanceGate from "@/components/layout/MaintenanceGate";
import Navbar from "@/components/layout/Navbar";
import SiteBanner from "@/components/layout/SiteBanner";
import Footer from "@/components/layout/Footer";
import { getSiteConfig } from "@/lib/settings";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#2e7d32" };

export async function generateMetadata(): Promise<Metadata> {
  const c = await getSiteConfig();
  return {
    title: { default: `${c.clubName} | ${c.heroTitle}`, template: `%s | ${c.clubName}` },
    description: c.heroSubtitle,
    icons: { icon: "/logo.png" },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const config = await getSiteConfig();

  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <MaintenanceGate enabled={config.maintenanceMode} message={config.maintenanceMessage} clubName={config.clubName}>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:shadow-lg"
          >
            Skip to content
          </a>
          <ChromeGate>
            <SiteBanner text={config.bannerText} href={config.bannerLink} />
            <Navbar clubName={config.clubName} />
          </ChromeGate>
          <main id="main" className="flex flex-grow flex-col">
            {children}
          </main>
          <ChromeGate><Footer /></ChromeGate>
        </MaintenanceGate>
      </body>
    </html>
  );
}
