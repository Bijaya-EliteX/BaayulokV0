import { createContext, useContext, useState, type ReactNode } from "react";

interface AuthModalContextType {
  isOpen: boolean;
  defaultTab: "login" | "signup";
  openLogin: () => void;
  openSignup: () => void;
  close: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | null>(null);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [defaultTab, setDefaultTab] = useState<"login" | "signup">("login");

  const openLogin = () => { setDefaultTab("login"); setIsOpen(true); };
  const openSignup = () => { setDefaultTab("signup"); setIsOpen(true); };
  const close = () => setIsOpen(false);

  return (
    <AuthModalContext.Provider value={{ isOpen, defaultTab, openLogin, openSignup, close }}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal must be used within AuthModalProvider");
  return ctx;
}
