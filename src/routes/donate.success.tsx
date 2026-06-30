import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/donate/success")({
  head: () => ({ meta: [{ title: "Thank you! — BaayuLok" }] }),
  component: () => (
    <div className="mx-auto grid min-h-[70vh] max-w-md place-items-center px-4 text-center">
      <div>
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-primary/10 text-primary"><CheckCircle2 className="h-10 w-10" /></div>
        <h1 className="mt-6 font-display text-4xl font-bold">Donation received 🙏</h1>
        <p className="mt-2 text-muted-foreground">Thank you for being a helping hand. A receipt has been sent to your email.</p>
        <Link to="/campaign/list"><Button className="mt-6 rounded-full">Discover more campaigns</Button></Link>
      </div>
    </div>
  ),
});