import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Login or Sign up — BaayuLok" }] }),
  component: Page,
});

function Page() {
  const [tab, setTab] = useState<"login" | "signup">("login");
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
        <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
          {tab === "signup" && <div className="space-y-2"><Label>Full name</Label><Input placeholder="Your name" /></div>}
          <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="you@example.com" /></div>
          <div className="space-y-2"><Label>Password</Label><Input type="password" placeholder="••••••••" /></div>
          <Button className="w-full rounded-full" size="lg">{tab === "login" ? "Login" : "Create account"}</Button>
        </form>
        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><div className="h-px flex-1 bg-border" />OR<div className="h-px flex-1 bg-border" /></div>
        <Button variant="outline" className="w-full rounded-full">Continue with Google</Button>
      </div>
    </div>
  );
}