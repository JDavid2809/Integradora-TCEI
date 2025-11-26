import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "../components/Navbar";
import Providers from "../components/Providers";
import { SearchProvider } from "../contexts/SearchContext";
import Chatbot from "@/components/ui/admin/Chatbot";
import PasswordChangeWrapper from "@/components/ui/PasswordChangeWrapper";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import ClickSpark from "@/components/ClickSpark";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Triunfando con el Inglés",
  description: "Cursos interactivos, recursos y certificaciones para aprender inglés desde cualquier lugar.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { url: "/icon192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon512_rounded.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="bg-white scroll-smooth">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="apple-touch-icon" href="/icon512_rounded.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-white text-[#00246a]`}
        suppressHydrationWarning={true}
      >
        <Providers>
          <SearchProvider>
            <PasswordChangeWrapper>
              <ClickSpark
                sparkColor='#00246a'
                sparkSize={25}
                sparkRadius={25}
                sparkCount={8}
                duration={400}
              >
                <NavBar /><br />
                <main className="pt-[80px] pb-16 px-4 min-h-screen bg-white">
                  {children}
                  
                <Chatbot />
                </main>
                <PWAInstallPrompt />
              </ClickSpark>
            </PasswordChangeWrapper>
          </SearchProvider>
        </Providers>
      </body>
    </html>
  );
}
