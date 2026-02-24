import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import { useAuth } from "./AuthContext";
import type { Conversation, Message, Contact } from "@/lib/chat/types";
import { SecureSession } from "@/lib/e2ee/SecureSession";
import { exportPublicKey } from "@/lib/crypto/keys";

const ChatContext = createContext<any>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user, getKeyPair, isCryptoReady } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const sessions = useRef(new Map<string, SecureSession>());

  /* -------- helpers -------- */

  const getSession = useCallback(
    async (conversation: Conversation) => {
      if (!sessions.current.has(conversation.id)) {
        const kp = getKeyPair();
        if (!kp || !isCryptoReady) {
          throw new Error("Crypto not ready");
        }

        const session = new SecureSession(kp);
        await session.establish(conversation.contact.publicKey);
        sessions.current.set(conversation.id, session);
      }
      return sessions.current.get(conversation.id)!;
    },
    [getKeyPair, isCryptoReady]
  );

  /* -------- actions -------- */

  const selectConversation = useCallback(
    async (conversationId: string) => {
      const conv = conversations.find((c) => c.id === conversationId);
      if (!conv) return;

      setActiveConversation(conv);
      setMessages([]);
    },
    [conversations]
  );

  const startConversation = useCallback(
    async (contact: Contact) => {
      const kp = getKeyPair();
      if (!kp) return;

      const publicKey = await exportPublicKey(kp.publicKey);

      // send to backend via WS
      console.log("startConversation", contact.id, publicKey);
    },
    [getKeyPair]
  );

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        messages,
        selectConversation,
        startConversation,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}
