import NavBar from "@/components/Navbar";
import Providers from "@/components/Providers";
import { SearchProvider } from "@/contexts/SearchContext";
import PasswordChangeWrapper from "@/components/ui/PasswordChangeWrapper";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <SearchProvider>
        <PasswordChangeWrapper>
          <NavBar /><br />
          <main className="pt-[80px] pb-16 px-4 min-h-screen bg-white">
            {children}
          </main>
          <PWAInstallPrompt />
        </PasswordChangeWrapper>
      </SearchProvider>
    </Providers>
  );
}
