import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowRight, ShieldCheck, FileText, HandCoins, Play, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampaignCard } from "@/components/site/campaign-card";
import { campaignsApi, categoriesApi, statsApi, type CampaignData, type CategoryData, type PlatformStats } from "@/lib/api";
import heroOrbit from "@/assets/hero-orbit.jpg";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BaayuLok — Every Hand Helps" },
      { name: "description", content: "Nepal's verified medical crowdfunding platform — fund surgeries, cancer care, emergencies and treatment for families who need it most." },
      { property: "og:title", content: "BaayuLok — Every Hand Helps" },
      { property: "og:description", content: "Start or support verified causes across Nepal." },
    ],
  }),
  component: Index,
});

function Index() {
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    categoriesApi.list().then(cat => setCategories(cat.data)).catch(() => {});
    statsApi.get().then(s => setStats(s.data)).catch(() => {});
    
    if (user) {
      campaignsApi.list({ limit: 6, status: "Active" })
        .then(c => setCampaigns(c.items))
        .catch(() => {});
    } else {
      setCampaigns([]);
    }
  }, [user]);

  return (
    <>
      <Hero />
      <HowFundraisingWorks />
      <StatsSection stats={stats} />
      <CategoriesSection categories={categories} />
      <Alliances />
      <AppPromo campaigns={campaigns} stats={stats} />
    </>
  );
}

const WORDS = ["Smile", "Hope", "Life", "Family"];

function Hero() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % WORDS.length), 2200);
    return () => clearInterval(t);
  }, []);
  return (
    <section className="relative overflow-hidden bg-[color:var(--cream)]">
      <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-[color:var(--saffron)]/20 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 md:grid-cols-2 md:px-6 md:py-28">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Nepal's #1 verified crowdfunding
          </span>
          <h1 className="mt-5 font-display text-5xl font-bold leading-[1.05] text-foreground md:text-7xl">
            Give someone a<br />
            <span className="inline-flex h-[1.1em] items-center overflow-hidden align-bottom">
              <AnimatePresence mode="wait">
                <motion.span
                  key={WORDS[i]}
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "-100%", opacity: 0 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="text-primary"
                >
                  {WORDS[i]}
                </motion.span>
              </AnimatePresence>
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            Every rupee on BaayuLok reaches a verified Nepali family. Donate, fundraise, and watch impact happen in real time.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/campaign/list"><Button size="lg" className="rounded-full">Donate Now <ArrowRight className="ml-1 h-4 w-4" /></Button></Link>
            <Link to="/campaign/create"><Button size="lg" variant="outline" className="rounded-full border-primary text-primary">Start a Campaign</Button></Link>
          </div>
          <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> KYC-verified causes</div>
            <div className="flex items-center gap-2"><HandCoins className="h-4 w-4 text-primary" /> 100% to beneficiary</div>
          </div>
        </div>
        <OrbitGraphic />
      </div>
    </section>
  );
}

function OrbitGraphic() {
  const nodes = ["🫀", "🎗️", "🚑", "🍼", "🧸", "💊"];
  return (
    <div className="relative mx-auto aspect-square w-full max-w-md">
      <motion.div
        className="absolute inset-6 rounded-full border-2 border-dashed border-primary/30"
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      />
      <div className="absolute inset-0 grid place-items-center">
        <div className="h-44 w-44 overflow-hidden rounded-full bg-primary shadow-xl">
          <img src={heroOrbit} alt="" className="h-full w-full object-cover" />
        </div>
      </div>
      {nodes.map((n, idx) => {
        const angle = (idx / nodes.length) * Math.PI * 2;
        const r = 44;
        const x = 50 + Math.cos(angle) * r;
        const y = 50 + Math.sin(angle) * r;
        return (
          <motion.div
            key={idx}
            className="absolute grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl border border-border bg-card text-2xl shadow-md"
            style={{ left: `${x}%`, top: `${y}%` }}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3 + idx * 0.3, repeat: Infinity, ease: "easeInOut" }}
          >
            {n}
          </motion.div>
        );
      })}
    </div>
  );
}

function Featured({ campaigns }: { campaigns: CampaignData[] }) {
  const tabs = ["All", "Surgery", "Cancer Care", "Emergency Care", "Chronic Illness"] as const;
  const [tab, setTab] = useState<typeof tabs[number]>("All");
  const list = tab === "All" ? campaigns : campaigns.filter((c) => c.category === tab);
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Live campaigns</p>
          <h2 className="mt-2 font-display text-4xl font-bold text-foreground md:text-5xl">Featured causes</h2>
        </div>
        <Link to="/campaign/list" className="text-sm font-semibold text-primary hover:underline">View all →</Link>
      </div>
      <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${tab === t ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:border-primary/40"}`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="mt-8 flex gap-6 overflow-x-auto pb-4 md:grid md:grid-cols-3 md:overflow-visible">
        {list.map((c) => (
          <CampaignCard key={c.slug} c={c} />
        ))}
      </div>
    </section>
  );
}

function StatsSection({ stats }: { stats: PlatformStats | null }) {
  const items = stats ? [
    { label: "Active Campaigns", value: stats.activeCampaigns, suffix: "+" },
    { label: "Total Donors", value: stats.totalDonors, suffix: "+" },
    { label: "Raised for Nepal", value: stats.totalRaised, prefix: "NPR ", format: true },
  ] : [];
  if (!stats) return null;
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-3 md:px-6">
        {items.map((it, i) => (
          <motion.div 
            key={it.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          >
            <Counter {...it} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Counter({ value, label, prefix = "", suffix = "", format = false }: { value: number; label: string; prefix?: string; suffix?: string; format?: boolean }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const dur = 1400;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return (
    <div className="text-center">
      <p className="font-display text-5xl font-bold md:text-6xl">{prefix}{format ? new Intl.NumberFormat("en-IN").format(n) : n.toLocaleString()}{suffix}</p>
      <p className="mt-2 text-sm uppercase tracking-widest text-primary-foreground/70">{label}</p>
    </div>
  );
}

function CategoriesSection({ categories }: { categories: CategoryData[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Empowering Nepal</p>
        <h2 className="mt-2 font-display text-4xl font-bold md:text-5xl">Causes close to home</h2>
      </div>
      <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
        {categories.map((c, i) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
          >
            <Link
              to="/categories"
              className="group flex h-full flex-col items-center justify-center rounded-2xl border border-border/60 bg-card p-6 text-center transition hover:-translate-y-1 hover:border-primary hover:shadow-lg"
            >
              <div className="text-4xl">{c.emoji}</div>
              <p className="mt-3 font-display text-sm font-semibold text-foreground">{c.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{c.campaignCount} campaigns</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

const alliances = ["eSewa", "Khalti", "NamastePay", "Fonepay", "IME Pay", "ConnectIPS", "NIC ASIA", "NMB Bank"];

function Alliances() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
      <p className="text-center text-sm font-semibold uppercase tracking-widest text-muted-foreground">Trusted payment partners</p>
      <div className="mt-8 overflow-hidden">
        <motion.div
          className="flex gap-12"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        >
          {[...alliances, ...alliances].map((a, i) => (
            <div key={i} className="grid h-16 shrink-0 place-items-center rounded-xl border border-border bg-card px-8 font-display text-lg font-bold text-muted-foreground">
              {a}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function AppPromo({ campaigns, stats }: { campaigns: CampaignData[]; stats: PlatformStats | null }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:px-6 overflow-hidden">
      <div className="grid items-center gap-10 rounded-[2.5rem] bg-[color:var(--ink)] p-8 text-background md:grid-cols-2 md:p-14">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-background">Coming soon</span>
          <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">BaayuLok in your pocket</h2>
          <p className="mt-4 text-background/70">Donate in two taps, track your impact, and follow campaigns you care about — anywhere in Nepal.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-xl bg-background/10 px-4 py-3 text-sm">📱 App Store</span>
            <span className="rounded-xl bg-background/10 px-4 py-3 text-sm">🤖 Google Play</span>
          </div>
          <div className="mt-8 flex items-center gap-3 text-sm">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-primary"><Play className="h-5 w-5 fill-current" /></span>
            <div>
              <p className="font-semibold">Watch our story</p>
              <p className="text-background/60">2 min · See how BaayuLok works</p>
            </div>
          </div>
        </motion.div>
        <motion.div 
          className="relative grid place-items-center"
          initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, type: "spring" }}
        >
          <div className="aspect-[9/16] w-56 rounded-[2.5rem] border-4 border-background/20 bg-gradient-to-br from-primary via-primary to-[color:var(--saffron)] p-3 shadow-2xl">
            <div className="flex h-full flex-col rounded-[2rem] bg-background/95 p-4 text-foreground">
              <p className="font-display text-xs font-bold text-primary">BaayuLok</p>
              <p className="mt-2 text-[10px] text-muted-foreground">Recently raised</p>
              {stats && (
                <p className="font-display text-2xl font-bold text-primary">
                  {`NPR ${new Intl.NumberFormat("en-IN").format(stats.totalRaised).slice(0, 12)}`}…
                </p>
              )}
              <div className="mt-3 space-y-2">
                {campaigns.slice(0, 2).map((c) => (
                  <div key={c.slug} className="rounded-xl bg-secondary p-2">
                    <div className="h-12 w-full overflow-hidden rounded bg-secondary/50 flex items-center justify-center text-xs text-muted-foreground">
                      {c.coverImage ? (
                        <img src={c.coverImage} alt="" className="h-full w-full object-cover" />
                      ) : "No image"}
                    </div>
                    <p className="mt-1 line-clamp-2 text-[10px] font-medium">{c.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function HowFundraisingWorks() {
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
        {steps.map((s, i) => (
          <motion.div 
            key={s.t} 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: i * 0.15, duration: 0.5 }}
            className="flex gap-5 rounded-2xl border border-border bg-card p-6 hover:border-primary/50 transition-colors"
          >
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><s.i className="h-5 w-5" /></div>
            <div>
              <h3 className="font-display text-xl font-bold">{s.t}</h3>
              <p className="mt-1 text-muted-foreground">{s.d}</p>
            </div>
          </motion.div>
        ))}
      </div>
      <motion.div 
        className="mt-12 rounded-3xl bg-primary p-10 text-center text-primary-foreground"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="font-display text-3xl font-bold">Ready to start?</h2>
        <p className="mt-2 text-primary-foreground/80">Most campaigns are reviewed and live within 48 hours.</p>
        <Link to="/campaign/create"><Button size="lg" variant="secondary" className="mt-5 rounded-full text-foreground hover:scale-105 transition-transform">Start your campaign</Button></Link>
      </motion.div>
    </div>
  );
}
