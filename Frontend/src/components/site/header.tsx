import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useAuthModal } from "@/hooks/use-auth-modal";

const nav = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/categories", label: "Donate" },
  { to: "/campaign/list", label: "Campaigns" },
  { to: "/profile", label: "Profile" },
];

export function SiteHeader() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { openLogin } = useAuthModal();

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-primary">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground">
            <Heart className="h-4 w-4 fill-current" />
          </span>
          BaayuLok
        </Link>
        {/* Center navigation links for logged‑in users */}
        {user && (
          <nav className="flex flex-1 justify-center gap-7 text-sm font-medium">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} className="text-foreground/80 transition hover:text-primary">
                {n.label}
              </Link>
            ))}
          </nav>
        )}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {user.role === "Admin" && (
                <Link to="/admin">
                  <Button variant="ghost">Admin</Button>
                </Link>
              )}
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="mr-1 h-4 w-4" />Sign out
              </Button>
            </>
          ) : (
            <Button variant="ghost" onClick={openLogin}>Login</Button>
          )}
          <Link to="/campaign/create">
            <Button className="rounded-full">Start a Campaign</Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
      {/* Mobile menu */}
      {open && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            {user && nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm hover:bg-secondary"
              >
                {n.label}
              </Link>
            ))}
            {user ? (
              <>
                {user.role === "Admin" && (
                  <Link to="/admin" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm hover:bg-secondary">
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => { handleLogout(); setOpen(false); }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-secondary"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </>
            ) : (
              <button onClick={() => { openLogin(); setOpen(false); }} className="rounded-md px-3 py-2 text-sm hover:bg-secondary">
                Login
              </button>
            )}
            <Link
              to="/campaign/create"
              onClick={() => setOpen(false)}
              className="mt-1 rounded-md bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground"
            >
              Start a Campaign
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
