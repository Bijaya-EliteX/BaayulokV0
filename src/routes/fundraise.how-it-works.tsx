import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { FileText, ShieldCheck, HandCoins, Megaphone } from "lucide-react";

export const Route = createFileRoute("/fundraise/how-it-works")({
  head: () => ({ meta: [{ title: "How It Works — BaayuLok" }, { name: "description", content: "Learn how to start a verified fundraising campaign on BaayuLok." }] }),
  component: Page,
});

function Page() {
  const steps = [
    { i: FileText, t: "1. Tell your story", d: "Write a clear, honest description of who you're raising for and how funds will be used." },
    { i: ShieldCheck, t: "2. Submit documents", d: "Upload citizenship, hospital letters, and any supporting bills. Our KYC team reviews in 48 hours." },
    { i: Megaphone, t: "3. Share widely", d: "Post your campaign on Facebook, Viber, and Instagram. Most donations come from your first network." },
    { i: HandCoins, t: "4. Receive funds", d: "Donations are paid directly to the verified beneficiary via eSewa or bank transfer." },
  ];
  return (
    <div className="mx-auto max-w-4xl px-4 py-20 md:px-6">
      <h1 className="font-display text-5xl font-bold">How fundraising works</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">BaayuLok was built for Nepali families. Here's how to launch a campaign that gets results.</p>
      <div className="mt-12 space-y-5">
        {steps.map((s) => (
          <div key={s.t} className="flex gap-5 rounded-2xl border border-border bg-card p-6">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><s.i className="h-5 w-5" /></div>
            <div>
              <h3 className="font-display text-xl font-bold">{s.t}</h3>
              <p className="mt-1 text-muted-foreground">{s.d}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-12 rounded-3xl bg-primary p-10 text-center text-primary-foreground">
        <h2 className="font-display text-3xl font-bold">Ready to start?</h2>
        <p className="mt-2 text-primary-foreground/80">Most campaigns are reviewed and live within 48 hours.</p>
        <Link to="/campaign/create"><Button size="lg" variant="secondary" className="mt-5 rounded-full">Start your campaign</Button></Link>
      </div>
    </div>
  );
}