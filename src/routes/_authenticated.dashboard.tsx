import { createFileRoute } from "@tanstack/react-router";
import { campaigns, formatNpr } from "@/lib/mock-data";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — BaayuLok" }] }),
  component: Page,
});

function Page() {
  const mine = campaigns.slice(0, 2);
  const donations = [
    { id: 1, to: campaigns[0].title, amt: 5000, date: "Jun 22, 2026" },
    { id: 2, to: campaigns[2].title, amt: 1000, date: "Jun 18, 2026" },
    { id: 3, to: campaigns[4].title, amt: 2500, date: "Jun 10, 2026" },
  ];
  return (
    <div className="mt-8 space-y-10">
      <div>
        <h1 className="font-display text-3xl font-bold">Welcome back, Rohit 👋</h1>
        <p className="text-muted-foreground">Here's how your campaigns and donations are doing.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Total raised" value={formatNpr(1280400)} />
        <Stat label="Active campaigns" value="2" />
        <Stat label="Lifetime donated" value={formatNpr(8500)} />
      </div>
      <section>
        <h2 className="font-display text-xl font-bold">My campaigns</h2>
        <div className="mt-4 space-y-3">
          {mine.map(c => (
            <div key={c.slug} className="flex gap-4 rounded-2xl border border-border bg-card p-4">
              <img src={c.cover} alt="" className="h-20 w-28 rounded-lg object-cover" />
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold">{c.title}</h3>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Active</span>
                </div>
                <Progress value={Math.round((c.raised / c.goal) * 100)} className="mt-2 h-2" />
                <p className="mt-1 text-xs text-muted-foreground">{formatNpr(c.raised)} of {formatNpr(c.goal)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="font-display text-xl font-bold">My donations</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
          {donations.map(d => (
            <div key={d.id} className="flex items-center justify-between border-b border-border p-4 last:border-b-0">
              <div><p className="font-medium">{d.to}</p><p className="text-xs text-muted-foreground">{d.date}</p></div>
              <p className="font-display font-bold text-primary">{formatNpr(d.amt)}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-xl font-bold">KYC status</h2>
        <p className="mt-2 text-sm text-muted-foreground">Your documents are verified. You can launch new campaigns instantly.</p>
        <Button variant="outline" className="mt-3">Re-upload documents</Button>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold text-primary">{value}</p>
    </div>
  );
}