import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

export const Route = createFileRoute("/donate/failure")({
  head: () => ({ meta: [{ title: "Donation failed — BaayuLok" }] }),
  component: () => (
    <div className="mx-auto grid min-h-[70vh] max-w-md place-items-center px-4 text-center">
      <div>
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-destructive/10 text-destructive"><XCircle className="h-10 w-10" /></div>
        <h1 className="mt-6 font-display text-4xl font-bold">Payment failed</h1>
        <p className="mt-2 text-muted-foreground">Your donation didn't go through. No amount was charged. Please try again.</p>
        <Link to="/campaign/list"><Button className="mt-6 rounded-full">Try again</Button></Link>
      </div>
    </div>
  ),
});