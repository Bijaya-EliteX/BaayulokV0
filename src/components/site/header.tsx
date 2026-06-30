import { Link } from "@tanstack/react-router";
import { Heart, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const nav = [
  { to: "/categories", label: "Donate" },
  { to: "/campaign/list", label: "Campaigns" },
  { to: "/fundraise/how-it-works", label: "How it works" },
  { to: "/fundraise/tips-and-resources", label: "Resources" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-primary">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground">
            <Heart className="h-4 w-4 fill-current" />
          </span>
          BaayuLok
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="text-foreground/80 transition hover:text-primary">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="icon" aria-label="Search"><Search className="h-4 w-4" /></Button>
          <Link to="/auth"><Button variant="ghost">Login</Button></Link>
          <Link to="/campaign/create"><Button className="rounded-full">Start a Campaign</Button></Link>
        </div>
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      {open && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm hover:bg-secondary">
                {n.label}
              </Link>
            ))}
            <Link to="/auth" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm hover:bg-secondary">Login</Link>
            <Link to="/campaign/create" onClick={() => setOpen(false)} className="mt-1 rounded-md bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground">Start a Campaign</Link>
          </div>
        </div>
      )}
    </header>
  );
}