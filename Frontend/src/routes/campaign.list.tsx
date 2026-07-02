import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { Search, Loader2 } from "lucide-react";
import { campaignsApi, categoriesApi, type CampaignData, type CategoryData, getStoredUser } from "@/lib/api";
import { CampaignCard } from "@/components/site/campaign-card";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/campaign/list")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !getStoredUser()) {
      sessionStorage.setItem("openAuthModal", "1");
      throw redirect({ to: "/" });
    }
  },
  head: () => ({ meta: [{ title: "All Campaigns — BaayuLok" }, { name: "description", content: "Browse all live crowdfunding campaigns on BaayuLok." }] }),
  component: Page,
});

function Page() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      campaignsApi.list({ limit: 50, status: "Active" }),
      categoriesApi.list(),
    ]).then(([c, cat]) => {
      setCampaigns(c.items);
      setCategories(cat.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const list = useMemo(() => campaigns.filter(c =>
    (cat === "All" || c.category === cat) &&
    (q === "" || c.title.toLowerCase().includes(q.toLowerCase()) || c.location.toLowerCase().includes(q.toLowerCase()))
  ), [q, cat, campaigns]);

  return (
    <div className="mx-auto max-w-7xl px-2 md:px-4 pt-1 pb-4">
      <div className="flex items-center gap-1.5 w-full">
        <div className="relative shrink min-w-[120px] max-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search..."
            className="h-8 rounded-full pl-8 text-xs"
          />
        </div>
        <div className="flex items-center gap-1 overflow-hidden shrink w-full justify-start">
          {["All", ...categories.map(c => c.name)].map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`shrink rounded-full border px-2 py-1 text-[10px] md:text-[11px] whitespace-nowrap font-medium transition ${cat === c ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/40"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="mt-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {list.map((c) => (
            <CampaignCard key={c.slug} c={c} />
          ))}
        </div>
      )}
    </div>
  );
}
