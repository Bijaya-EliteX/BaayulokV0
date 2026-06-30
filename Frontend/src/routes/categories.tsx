import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { categoriesApi, campaignsApi, type CategoryData, type CampaignData } from "@/lib/api";
import { CampaignCard } from "@/components/site/campaign-card";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/categories")({
  head: () => ({ meta: [{ title: "Browse Categories — BaayuLok" }, { name: "description", content: "Explore Nepali crowdfunding causes by category." }] }),
  component: Page,
});

function Page() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      categoriesApi.list(),
      campaignsApi.list({ limit: 6, status: "Active" }),
    ]).then(([cat, c]) => {
      setCategories(cat.data);
      setCampaigns(c.items);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-32"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
      <h1 className="font-display text-5xl font-bold">Browse by category</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">Find verified causes across Nepal. Every campaign is reviewed for authenticity before going live.</p>
      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
        {categories.map((c) => (
          <Link key={c.name} to="/campaign/list" className="rounded-2xl border border-border bg-card p-6 text-center hover:border-primary hover:shadow-md transition">
            <div className="text-4xl">{c.emoji}</div>
            <p className="mt-3 font-display text-sm font-semibold">{c.name}</p>
            <p className="text-xs text-muted-foreground">{c.campaignCount} campaigns</p>
          </Link>
        ))}
      </div>
      <h2 className="mt-16 font-display text-3xl font-bold">Trending right now</h2>
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {campaigns.slice(0, 6).map((c) => <CampaignCard key={c.slug} c={c} />)}
      </div>
    </div>
  );
}