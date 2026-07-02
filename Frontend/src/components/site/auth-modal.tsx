import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { useAuthModal } from "@/hooks/use-auth-modal";
import { authApi, setTokens, storeUser } from "@/lib/api";
import { useGoogleLogin } from "@react-oauth/google";
import { motion, AnimatePresence } from "framer-motion";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export function AuthModal() {
  const { isOpen, defaultTab, close } = useAuthModal();
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const [tab, setTab] = useState<"login" | "signup">(defaultTab);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Sync tab when defaultTab changes (from openLogin/openSignup)
  const effectiveTab = isOpen ? tab : defaultTab;

  const reset = () => {
    setFullName("");
    setEmail("");
    setPassword("");
    setError("");
    setLoading(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) { reset(); close(); }
  };

  const handleSuccess = (to: string = "/categories") => {
    reset();
    close();
    navigate({ to });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (effectiveTab === "login") {
        await login(email, password);
      } else {
        await signup(fullName, email, password);
      }
      handleSuccess();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-md">
        {/* Decorative gradient top bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-[color:var(--saffron)] to-primary" />

        <div className="px-8 pb-8 pt-6">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 font-display text-2xl font-bold text-primary">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground">
              <Heart className="h-4 w-4 fill-current" />
            </span>
            BaayuLok
          </div>

          <p className="mt-1 text-center text-sm text-muted-foreground">
            Nepal's #1 verified crowdfunding platform
          </p>

          {/* Tab switcher */}
          <div className="mt-5 grid grid-cols-2 rounded-full bg-secondary p-1">
            {(["login", "signup"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); }}
                className={`rounded-full py-2 text-sm font-semibold transition-all ${
                  effectiveTab === t
                    ? "bg-card text-foreground shadow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "login" ? "Login" : "Sign up"}
              </button>
            ))}
          </div>

          {/* Form */}
          <AnimatePresence mode="wait">
            <motion.form
              key={effectiveTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="mt-5 space-y-4"
              onSubmit={handleSubmit}
            >
              {effectiveTab === "signup" && (
                <div className="space-y-1.5">
                  <Label htmlFor="auth-fullname">Full name</Label>
                  <Input
                    id="auth-fullname"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your name"
                    className="rounded-xl"
                    required
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="auth-email">Email</Label>
                <Input
                  id="auth-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="you@example.com"
                  className="rounded-xl"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="auth-password">Password</Label>
                <Input
                  id="auth-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="••••••••"
                  className="rounded-xl"
                  required
                />
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-xl bg-destructive/10 p-3 text-sm font-medium text-destructive"
                >
                  {error}
                </motion.p>
              )}

              <Button className="w-full rounded-full" size="lg" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {effectiveTab === "login" ? "Login" : "Create account"}
              </Button>
            </motion.form>
          </AnimatePresence>

          {/* Divider */}
          <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            OR
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Google login */}
          {GOOGLE_CLIENT_ID ? (
            <GoogleLoginButton onSuccess={handleSuccess} />
          ) : (
            <p className="text-center text-xs text-muted-foreground">Google login not configured</p>
          )}

          {/* Toggle hint */}
          <p className="mt-5 text-center text-xs text-muted-foreground">
            {effectiveTab === "login" ? (
              <>Don't have an account?{" "}
                <button onClick={() => setTab("signup")} className="font-semibold text-primary hover:underline">
                  Sign up
                </button>
              </>
            ) : (
              <>Already have an account?{" "}
                <button onClick={() => setTab("login")} className="font-semibold text-primary hover:underline">
                  Login
                </button>
              </>
            )}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function GoogleLoginButton({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);

  const login = useGoogleLogin({
    onSuccess: async (res) => {
      setLoading(true);
      try {
        const r = await authApi.googleLogin((res as any).id_token);
        setTokens(r.data.accessToken, r.data.refreshToken);
        storeUser(r.data.user);
        onSuccess();
      } catch {
        setLoading(false);
      }
    },
    onError: () => setLoading(false),
  });

  return (
    <Button variant="outline" className="w-full rounded-full" onClick={() => login()} disabled={loading}>
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
      )}
      Continue with Google
    </Button>
  );
}
