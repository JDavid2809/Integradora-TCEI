import NavBar from "@/components/Navbar";
import ChatFab from "@/components/ChatFab";
import { ChatProvider } from '@/contexts/ChatContext'
import Providers from "@/components/Providers";
import { SearchProvider } from "@/contexts/SearchContext";
import PasswordChangeWrapper from "../../../docs/ui/PasswordChangeWrapper";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import Chatbot from "../../../docs/ui/admin/Chatbot";
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
            <ChatProvider>
              <NavBar /><br />
            <main className="pt-[80px] pb-16 px-4 min-h-screen bg-background dark:bg-slate-900 transition-colors duration-300">
              {children}
              {/* <Chatbot /> */}
            </main>
            {/* Chat bubble for mobile users */}
            <div className="block lg:hidden">
              <ChatFab />
            </div>
          </ChatProvider>
            <PWAInstallPrompt />
          </ClickSpark>
        </PasswordChangeWrapper>
      </SearchProvider>
    </Providers>
  );
}
