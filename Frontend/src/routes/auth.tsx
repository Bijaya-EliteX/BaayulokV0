import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { authApi, setTokens, storeUser } from "@/lib/api";
import { useGoogleLogin } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Login or Sign up — BaayuLok" }] }),
  component: Page,
});

function Page() {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (tab === "login") {
        await login(email, password);
      } else {
        await signup(fullName, email, password);
      }
      navigate({ to: "/" });
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid min-h-[80vh] max-w-md place-items-center px-4 py-16">
      <div className="w-full rounded-3xl border border-border bg-card p-8 shadow-lg">
        <Link to="/" className="flex items-center justify-center gap-2 font-display text-2xl font-bold text-primary">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground"><Heart className="h-4 w-4 fill-current" /></span>
          BaayuLok
        </Link>
        <div className="mt-6 grid grid-cols-2 rounded-full bg-secondary p-1">
          {(["login","signup"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`rounded-full py-2 text-sm font-semibold transition ${tab === t ? "bg-card text-foreground shadow" : "text-muted-foreground"}`}>{t === "login" ? "Login" : "Sign up"}</button>
          ))}
        </div>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {tab === "signup" && <div className="space-y-2"><Label>Full name</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" /></div>}
          <div className="space-y-2"><Label>Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" /></div>
          <div className="space-y-2"><Label>Password</Label><Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" /></div>
          {error && <p className="rounded-lg bg-destructive/10 p-3 text-sm font-medium text-destructive">{error}</p>}
          <Button className="w-full rounded-full" size="lg" disabled={loading}>{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}{tab === "login" ? "Login" : "Create account"}</Button>
        </form>
        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><div className="h-px flex-1 bg-border" />OR<div className="h-px flex-1 bg-border" /></div>
        {GOOGLE_CLIENT_ID ? (
          <GoogleLoginButton />
        ) : (
          <p className="text-center text-xs text-muted-foreground">Google login not configured</p>
        )}
      </div>
    </div>
  );
}

function GoogleLoginButton() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const login = useGoogleLogin({
    onSuccess: async (res) => {
      setLoading(true);
      try {
        const r = await authApi.googleLogin((res as any).id_token);
        setTokens(r.data.accessToken, r.data.refreshToken);
        storeUser(r.data.user);
        navigate({ to: "/" });
      } catch (err: any) {
        setLoading(false);
      }
    },
    onError: () => setLoading(false),
  });

  return (
    <Button variant="outline" className="w-full rounded-full" onClick={() => login()} disabled={loading}>
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Continue with Google
    </Button>
  );
}