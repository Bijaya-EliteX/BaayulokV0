import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { campaignsApi, formatNpr, type CampaignData, type DonorInfo, getStoredUser } from "@/lib/api";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { MapPin, ShieldCheck, Share2, Clock, Users, Heart, Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { DonationModal } from "@/components/site/donation-modal";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/campaign/$slug")({
  beforeLoad: () => {
    if (!getStoredUser()) {
      sessionStorage.setItem("openAuthModal", "1");
      throw redirect({ to: "/" });
    }
  },
  loader: ({ params }) => campaignsApi.get(params.slug).then(r => r.data),
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title ?? "Campaign"} — BaayuLok` },
      { name: "description", content: loaderData?.story?.slice(0, 150) ?? "" },
      { property: "og:image", content: loaderData?.coverImage ?? "" },
    ],
  }),
  component: Page,
  notFoundComponent: () => <div className="mx-auto max-w-3xl px-4 py-24 text-center"><h1 className="font-display text-4xl">Campaign not found</h1><Link to="/campaign/list" className="mt-4 inline-block text-primary underline">Browse all campaigns</Link></div>,
  errorComponent: ({ error }) => <div className="mx-auto max-w-3xl px-4 py-24 text-center"><h1 className="font-display text-3xl">Something went wrong</h1><p className="mt-2 text-muted-foreground">{error.message}</p></div>,
});

function Page() {
  const c = Route.useLoaderData() as CampaignData;
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const [donors, setDonors] = useState<DonorInfo[]>([]);
  const [donorsLoading, setDonorsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const pct = Math.min(100, Math.round((c.raised / c.goal) * 100));

  useEffect(() => {
    campaignsApi.donors(c.slug)
      .then(r => setDonors(r.data))
      .catch(() => {})
      .finally(() => setDonorsLoading(false));
  }, [c.slug]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
      <div className="mb-4 text-sm text-muted-foreground"><Link to="/campaign/list" className="hover:text-primary">Campaigns</Link> / <span className="text-foreground">{c.category}</span></div>
      <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <div className="overflow-hidden rounded-3xl border border-border">
            <img src={c.coverImage ?? ""} alt={c.title} className="aspect-[16/10] w-full object-cover" />
          </div>
          <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{c.category}</span>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight md:text-5xl">{c.title}</h1>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{c.location}</span>
            <span>For: <strong className="text-foreground">{c.beneficiaryName}</strong></span>
            {c.verified && <span className="flex items-center gap-1 text-primary"><ShieldCheck className="h-4 w-4" />KYC verified</span>}
          </div>
          <div className="mt-8">
            <h2 className="font-display text-2xl font-bold">The story</h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">{c.story}</p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">All donations are routed through eSewa and disbursed directly to the verified beneficiary's account within 72 hours of campaign closure. Hospital bills and receipts will be uploaded as updates here.</p>
          </div>
          <div className="mt-10">
            <h3 className="font-display text-xl font-bold">Recent donors</h3>
            {donorsLoading ? (
              <div className="mt-4 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : donors.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">No donations yet. Be the first to contribute!</p>
            ) : (
              <div className="mt-4 grid gap-3">
                {donors.map((d, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary"><Heart className="h-4 w-4" /></div>
                    <div className="flex-1">
                      <div className="flex items-baseline justify-between"><p className="font-semibold">{d.name || "Anonymous"}</p><p className="font-display text-primary">{formatNpr(d.amount)}</p></div>
                      {d.message && <p className="mt-1 text-sm text-muted-foreground">{d.message}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <p className="font-display text-4xl font-bold text-primary">{formatNpr(c.raised)}</p>
            <p className="text-sm text-muted-foreground">raised of {formatNpr(c.goal)} goal</p>
            <Progress value={pct} className="mt-4 h-3" />
            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <Stat icon={Users} label="Donors" value={c.donorsCount.toString()} />
              <Stat icon={Clock} label="Days left" value={c.daysLeft.toString()} />
              <Stat icon={ShieldCheck} label="Verified" value={c.verified ? "Yes" : "Pending"} />
            </div>
            {isAdmin ? (
              <div className="mt-6 rounded-full bg-green-100 px-4 py-3 text-center font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                Approved
              </div>
            ) : (
              <>
                <Button size="lg" className="mt-6 w-full rounded-full" onClick={() => setModalOpen(true)}>Donate now</Button>
                <Button size="lg" variant="outline" className="mt-2 w-full rounded-full"><Share2 className="mr-2 h-4 w-4" />Share campaign</Button>
              </>
            )}
            <div className="mt-6 rounded-xl bg-secondary p-4 text-xs text-muted-foreground">
              Powered by <strong className="text-foreground">eSewa</strong> & <strong className="text-foreground">Khalti</strong>. Your donation is processed securely.
            </div>
          </div>
        </aside>
      </div>
      <DonationModal open={modalOpen} onOpenChange={setModalOpen} campaignSlug={c.slug} campaignTitle={c.title} />
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