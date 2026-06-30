import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { campaigns, formatNpr } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Check, X, FileText } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin Review — BaayuLok" }] }),
  component: Page,
});

function Page() {
  const [tab, setTab] = useState<"pending" | "active" | "rejected">("pending");
  const list = tab === "pending" ? campaigns.filter(c => !c.verified) : tab === "active" ? campaigns.filter(c => c.verified) : [];
  return (
    <div className="mt-8 space-y-6">
      <h1 className="font-display text-3xl font-bold">Admin · Review queue</h1>
      <div className="flex gap-2">
        {(["pending","active","rejected"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize ${tab === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{t}</button>
        ))}
      </div>
      {list.length === 0 && <p className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">Nothing here yet.</p>}
      <div className="space-y-4">
        {list.map(c => (
          <div key={c.slug} className="grid gap-4 rounded-2xl border border-border bg-card p-5 md:grid-cols-[160px_1fr_auto]">
            <img src={c.cover} alt="" className="h-28 w-full rounded-lg object-cover" />
            <div>
              <h3 className="font-display text-lg font-bold">{c.title}</h3>
              <p className="text-sm text-muted-foreground">By {c.beneficiary} · {c.location}</p>
              <p className="mt-1 text-sm">Goal: <strong>{formatNpr(c.goal)}</strong></p>
              <div className="mt-3 flex gap-2 text-xs">
                <span className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1"><FileText className="h-3 w-3" />Citizenship.pdf</span>
                <span className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1"><FileText className="h-3 w-3" />Hospital_letter.pdf</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {tab === "pending" && <>
                <Button size="sm"><Check className="mr-1 h-4 w-4" />Approve</Button>
                <Button size="sm" variant="outline"><X className="mr-1 h-4 w-4" />Reject</Button>
              </>}
              {tab === "active" && <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">Verified</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}