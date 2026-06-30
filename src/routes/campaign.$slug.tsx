import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { campaigns, formatNpr } from "@/lib/mock-data";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { MapPin, ShieldCheck, Share2, Clock, Users, Heart } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const Route = createFileRoute("/campaign/$slug")({
  loader: ({ params }) => {
    const c = campaigns.find((x) => x.slug === params.slug);
    if (!c) throw notFound();
    return c;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title ?? "Campaign"} — BaayuLok` },
      { name: "description", content: loaderData?.story?.slice(0, 150) ?? "" },
      { property: "og:image", content: loaderData?.cover ?? "" },
    ],
  }),
  component: Page,
  notFoundComponent: () => <div className="mx-auto max-w-3xl px-4 py-24 text-center"><h1 className="font-display text-4xl">Campaign not found</h1><Link to="/campaign/list" className="mt-4 inline-block text-primary underline">Browse all campaigns</Link></div>,
  errorComponent: ({ error }) => <div className="mx-auto max-w-3xl px-4 py-24 text-center"><h1 className="font-display text-3xl">Something went wrong</h1><p className="mt-2 text-muted-foreground">{error.message}</p></div>,
});

function Page() {
  const c = Route.useLoaderData();
  const pct = Math.min(100, Math.round((c.raised / c.goal) * 100));
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
      <div className="mb-4 text-sm text-muted-foreground"><Link to="/campaign/list" className="hover:text-primary">Campaigns</Link> / <span className="text-foreground">{c.category}</span></div>
      <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <div className="overflow-hidden rounded-3xl border border-border">
            <img src={c.cover} alt={c.title} className="aspect-[16/10] w-full object-cover" />
          </div>
          <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{c.category}</span>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight md:text-5xl">{c.title}</h1>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{c.location}</span>
            <span>For: <strong className="text-foreground">{c.beneficiary}</strong></span>
            {c.verified && <span className="flex items-center gap-1 text-primary"><ShieldCheck className="h-4 w-4" />KYC verified</span>}
          </div>
          <div className="mt-8">
            <h2 className="font-display text-2xl font-bold">The story</h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">{c.story}</p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">All donations are routed through eSewa and disbursed directly to the verified beneficiary's account within 72 hours of campaign closure. Hospital bills and receipts will be uploaded as updates here.</p>
          </div>
          <div className="mt-10">
            <h3 className="font-display text-xl font-bold">Recent donors</h3>
            <div className="mt-4 grid gap-3">
              {[{n:"Anonymous",a:5000,m:"Praying for a speedy recovery 🙏"},{n:"Bibek K.",a:1000,m:""},{n:"Sushma R.",a:2500,m:"Stay strong!"},{n:"Anonymous",a:500,m:""}].map((d, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary"><Heart className="h-4 w-4" /></div>
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between"><p className="font-semibold">{d.n}</p><p className="font-display text-primary">{formatNpr(d.a)}</p></div>
                    {d.m && <p className="mt-1 text-sm text-muted-foreground">{d.m}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <p className="font-display text-4xl font-bold text-primary">{formatNpr(c.raised)}</p>
            <p className="text-sm text-muted-foreground">raised of {formatNpr(c.goal)} goal</p>
            <Progress value={pct} className="mt-4 h-3" />
            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <Stat icon={Users} label="Donors" value={c.donors.toString()} />
              <Stat icon={Clock} label="Days left" value={c.daysLeft.toString()} />
              <Stat icon={ShieldCheck} label="Verified" value={c.verified ? "Yes" : "Pending"} />
            </div>
            <Button size="lg" className="mt-6 w-full rounded-full">Donate now</Button>
            <Button size="lg" variant="outline" className="mt-2 w-full rounded-full"><Share2 className="mr-2 h-4 w-4" />Share campaign</Button>
            <div className="mt-6 rounded-xl bg-secondary p-4 text-xs text-muted-foreground">
              Powered by <strong className="text-foreground">eSewa</strong> & <strong className="text-foreground">Khalti</strong>. Your donation is processed securely.
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary p-3">
      <Icon className="mx-auto h-4 w-4 text-primary" />
      <p className="mt-1 font-display text-lg font-bold">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}