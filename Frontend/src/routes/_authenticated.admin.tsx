import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { adminApi, formatNpr, getImageUrl, type AdminCampaign, getStoredUser } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: () => {
    const user = getStoredUser();
    if (user?.role !== "Admin") {
      throw redirect({ to: "/dashboard" });
    }
  },
  head: () => ({ meta: [{ title: "Admin Review — BaayuLok" }] }),
  component: Page,
});

function Page() {
  const [tab, setTab] = useState<"Pending" | "Active" | "Rejected">("Pending");
  const [list, setList] = useState<AdminCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchList = () => {
    setLoading(true);
    adminApi.campaigns(tab)
      .then(r => setList(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchList(); }, [tab]);

  const handleApprove = async (slug: string) => {
    setActionLoading(slug);
    try {
      await adminApi.approve(slug);
      fetchList();
    } catch {}
    setActionLoading(null);
  };

  const handleReject = async (slug: string) => {
    const reason = prompt("Rejection reason:");
    if (!reason) return;
    setActionLoading(slug);
    try {
      await adminApi.reject(slug, reason);
      fetchList();
    } catch {}
    setActionLoading(null);
  };

  const tabs = ["Pending", "Active", "Rejected"] as const;

  return (
    <div className="mt-8 space-y-6">
      <h1 className="font-display text-3xl font-bold">Admin · Review queue</h1>
      <div className="flex gap-2">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize ${tab === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{t.toLowerCase()}</button>
        ))}
      </div>
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : list.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">Nothing here yet.</p>
      ) : (
        <div className="space-y-4">
          {list.map(c => (
            <div key={c.slug} className="grid gap-4 rounded-2xl border border-border bg-card p-5 md:grid-cols-[160px_1fr_auto]">
              {getImageUrl(c.coverImage) && <img src={getImageUrl(c.coverImage)!} alt="" className="h-28 w-full rounded-lg object-cover" />}
              <div>
                <h3 className="font-display text-lg font-bold">{c.title}</h3>
                <p className="text-sm text-muted-foreground">By {c.creatorName} · {c.location}</p>
                <p className="mt-1 text-sm">Goal: <strong>{formatNpr(c.goal)}</strong> · Raised: <strong>{formatNpr(c.raised)}</strong></p>
                <p className="text-xs text-muted-foreground mt-1">Contact: {c.creatorEmail}</p>
              </div>
              <div className="flex flex-col gap-2">
                {tab === "Pending" && <>
                  <Button size="sm" onClick={() => handleApprove(c.slug)} disabled={actionLoading === c.slug}>
                    {actionLoading === c.slug ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Check className="mr-1 h-4 w-4" />}
                    Approve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleReject(c.slug)} disabled={actionLoading === c.slug}>
                    <X className="mr-1 h-4 w-4" />Reject
                  </Button>
                </>}
                {tab === "Active" && <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">Active</span>}
                {tab === "Rejected" && <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">Rejected</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}