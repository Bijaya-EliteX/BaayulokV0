import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import { campaignsApi, formatNpr, resolveImageUrl, type CampaignData, type DonorInfo, getStoredUser } from "@/lib/api";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { MapPin, ShieldCheck, Clock, Users, Heart, Loader2, ChevronLeft, ChevronRight, FileText } from "lucide-react";
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
      { property: "og:image", content: resolveImageUrl(loaderData?.images?.[0] ?? loaderData?.coverImage) },
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
  const [imgIndex, setImgIndex] = useState(0);
  const [animDir, setAnimDir] = useState<"left" | "right">("right");
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const allImages = c.images?.length ? c.images : (c.coverImage ? [c.coverImage] : []);
  const hospitalDocs = c.documents?.filter(d => d.documentType === "HospitalLetter") ?? [];

  const pct = Math.min(100, Math.round((c.raised / c.goal) * 100));

  const goNext = useCallback(() => {
    setAnimDir("right");
    setImgIndex(i => (i + 1) % allImages.length);
  }, [allImages.length]);

  const goPrev = useCallback(() => {
    setAnimDir("left");
    setImgIndex(i => (i - 1 + allImages.length) % allImages.length);
  }, [allImages.length]);

  useEffect(() => {
    if (allImages.length <= 1) return;
    intervalRef.current = setInterval(goNext, 4000);
    return () => clearInterval(intervalRef.current);
  }, [allImages.length, goNext]);

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
          {allImages.length > 0 && (
            <div className="relative overflow-hidden rounded-3xl border border-border">
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                {allImages.map((img, i) => (
                  <img
                    key={i}
                    src={resolveImageUrl(img)}
                    alt={`${c.title} ${i + 1}`}
                    className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ${
                      i === imgIndex
                        ? "opacity-100 translate-x-0"
                        : animDir === "right"
                          ? "opacity-0 -translate-x-full"
                          : "opacity-0 translate-x-full"
                    }`}
                    style={{ display: i === imgIndex ? "block" : "none" }}
                  />
                ))}
              </div>
              {allImages.length > 1 && (
                <>
                  <button onClick={goPrev} className="absolute left-3 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-background/80 text-foreground shadow hover:bg-background transition"><ChevronLeft className="h-5 w-5" /></button>
                  <button onClick={goNext} className="absolute right-3 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-background/80 text-foreground shadow hover:bg-background transition"><ChevronRight className="h-5 w-5" /></button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {allImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => { setAnimDir(i > imgIndex ? "right" : "left"); setImgIndex(i); }}
                        className={`h-2 rounded-full transition-all ${i === imgIndex ? "w-6 bg-primary" : "w-2 bg-background/70 hover:bg-background"}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{c.category}</span>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight md:text-5xl">{c.title}</h1>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{c.location}</span>
            <span>For: <strong className="text-foreground">{c.beneficiaryName}</strong> ({c.relationship})</span>
            {c.verified && <span className="flex items-center gap-1 text-primary"><ShieldCheck className="h-4 w-4" />KYC verified</span>}
          </div>
          <div className="mt-8">
            <h2 className="font-display text-2xl font-bold">The story</h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">{c.story}</p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">All donations are routed through eSewa and disbursed directly to the verified beneficiary's account within 72 hours of campaign closure. Hospital bills and receipts will be uploaded as updates here.</p>
          </div>

          {hospitalDocs.length > 0 && (
            <div className="mt-10">
              <h3 className="font-display text-xl font-bold">Hospital documents</h3>
              <div className="mt-4 grid gap-3">
                {hospitalDocs.map((doc) => (
                  <a key={doc.id} href={resolveImageUrl(doc.fileUrl)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition hover:border-primary/50">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary"><FileText className="h-5 w-5" /></span>
                    <div>
                      <p className="font-semibold">{doc.fileName}</p>
                      <p className="text-xs text-muted-foreground capitalize">{doc.documentType}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

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
              </>
            )}
            <div className="mt-6 rounded-xl bg-secondary p-4 text-xs text-muted-foreground">
              Powered by <strong className="text-foreground">eSewa</strong>. Your donation is processed securely.
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
