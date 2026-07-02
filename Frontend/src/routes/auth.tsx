import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuthModal } from "@/hooks/use-auth-modal";
import { getStoredUser } from "@/lib/api";

export const Route = createFileRoute("/auth")({
  beforeLoad: () => {
    // If already logged in, redirect to categories
    if (getStoredUser()) throw redirect({ to: "/categories" });
  },
  head: () => ({ meta: [{ title: "Login or Sign up — BaayuLok" }] }),
  component: Page,
});

function Page() {
  const { openLogin } = useAuthModal();

  // As soon as this page mounts, open the modal and stay on "/"
  useEffect(() => {
    openLogin();
  }, []);

  // Render nothing — the modal handles everything
  return null;
}