import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { campaigns, categories } from "@/lib/mock-data";
import { CampaignCard } from "@/components/site/campaign-card";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/campaign/list")({
  head: () => ({ meta: [{ title: "All Campaigns — BaayuLok" }, { name: "description", content: "Browse all live crowdfunding campaigns on BaayuLok." }] }),
  component: Page,
});

function Page() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");
  const list = useMemo(() => campaigns.filter(c =>
    (cat === "All" || c.category === cat) &&
    (q === "" || c.title.toLowerCase().includes(q.toLowerCase()) || c.location.toLowerCase().includes(q.toLowerCase()))
  ), [q, cat]);
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
      <h1 className="font-display text-5xl font-bold">All campaigns</h1>
      <p className="mt-3 text-muted-foreground">{list.length} verified causes looking for your support.</p>
      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or location…" className="h-12 rounded-full pl-10" />
        </div>
      </div>
      <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
        {["All", ...categories.map(c => c.name)].map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${cat === c ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/40"}`}>{c}</button>
        ))}
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {list.map((c) => <CampaignCard key={c.slug} c={c} />)}
      </div>
    </div>
  );
}