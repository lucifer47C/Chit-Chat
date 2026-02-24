
import { Toaster } from "./components/ui/toaster";
import { ChatProvider } from "./contexts/ChatContext";
import { useAuth } from "./contexts/AuthContext";
import { ChatLayout } from "./components/chat/ChatLayout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import { CryptoStatusGate } from "./components/auth/CryptoStatusGate";
import { AuthPage } from "./components/auth/AuthPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    </QueryClientProvider>
  );
}

function AuthConsumer() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <CryptoStatusGate>
      <ChatProvider>
        <ChatLayout />
        <Toaster />
      </ChatProvider>
    </CryptoStatusGate>
  );
}

export default App;
