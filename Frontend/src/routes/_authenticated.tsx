import { createFileRoute, Outlet, Link, redirect } from "@tanstack/react-router";
import { LayoutDashboard, ShieldCheck, User } from "lucide-react";
import { getStoredUser } from "@/lib/api";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: () => {
    const user = getStoredUser();
    if (!user) {
      sessionStorage.setItem("openAuthModal", "1");
      throw redirect({ to: "/" });
    }
  },
  component: () => {
    const user = getStoredUser();
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="flex gap-4 border-b border-border pb-4 text-sm font-medium">
          <Link to="/dashboard" activeProps={{ className: "text-primary" }} className="flex items-center gap-1.5"><LayoutDashboard className="h-4 w-4" />Dashboard</Link>
          <Link to="/profile" activeProps={{ className: "text-primary" }} className="flex items-center gap-1.5"><User className="h-4 w-4" />Profile</Link>
          {user?.role === "Admin" && (
            <Link to="/admin" activeProps={{ className: "text-primary" }} className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" />Admin</Link>
          )}
        </div>
        <Outlet />
      </div>
    );
  },
});
