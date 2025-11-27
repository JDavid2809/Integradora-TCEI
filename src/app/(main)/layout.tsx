import NavBar from "@/components/Navbar";
import Providers from "@/components/Providers";
import { SearchProvider } from "@/contexts/SearchContext";
import PasswordChangeWrapper from "@/components/ui/PasswordChangeWrapper";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import Chatbot from "@/components/ui/admin/Chatbot";
import ClickSpark from "@/components/ClickSpark";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
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
              {/* <Chatbot /> */}
            </main>
            <PWAInstallPrompt />
          </ClickSpark>
        </PasswordChangeWrapper>
      </SearchProvider>
    </Providers>
  );
}
