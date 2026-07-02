import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { usersApi, adminApi, formatNpr, resolveImageUrl, type UserCampaign, type UserDonation, type DashboardStats, type PlatformStats, type AdminCampaign } from "@/lib/api";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Check, X, ShieldCheck, TrendingUp, Users, Wallet } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — BaayuLok" }] }),
  component: Page,
});

function Page() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  if (isAdmin) return <AdminDashboard />;
  return <UserDashboard />;
}

function UserDashboard() {
  const [myCampaigns, setMyCampaigns] = useState<UserCampaign[]>([]);
  const [myDonations, setMyDonations] = useState<UserDonation[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      usersApi.myCampaigns(),
      usersApi.myDonations(),
      usersApi.stats(),
    ]).then(([c, d, s]) => {
      setMyCampaigns(c.data);
      setMyDonations(d.data);
      setStats(s.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="mt-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="mt-8 space-y-10">
      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Total raised" value={stats ? formatNpr(stats.totalRaised) : "NPR 0"} icon={TrendingUp} />
        <Stat label="Active campaigns" value={stats ? String(stats.activeCampaigns) : "0"} icon={ShieldCheck} />
        <Stat label="Lifetime donated" value={stats ? formatNpr(stats.lifetimeDonated) : "NPR 0"} icon={Wallet} />
      </div>
      <section>
        <h2 className="font-display text-xl font-bold">My campaigns ({myCampaigns.length})</h2>
        {myCampaigns.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">You haven't started any campaigns yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {myCampaigns.map(c => (
              <div key={c.slug} className="flex gap-4 rounded-2xl border border-border bg-card p-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold">{c.title}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                      c.status === "Active" ? "bg-green-100 text-green-700" :
                      c.status === "Pending" ? "bg-yellow-100 text-yellow-700" :
                      c.status === "Rejected" ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>{c.status}</span>
                  </div>
                  <Progress value={Math.round((c.raised / c.goal) * 100)} className="mt-2 h-2" />
                  <p className="mt-1 text-xs text-muted-foreground">{formatNpr(c.raised)} of {formatNpr(c.goal)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      <section>
        <h2 className="font-display text-xl font-bold">My donations ({myDonations.length})</h2>
        {myDonations.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">You haven't made any donations yet.</p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
            {myDonations.map(d => (
              <div key={d.id} className="flex items-center justify-between border-b border-border p-4 last:border-b-0">
                <div><p className="font-medium">{d.campaignTitle}</p><p className="text-xs text-muted-foreground">{new Date(d.createdAt).toLocaleDateString()}</p></div>
                <p className="font-display font-bold text-primary">{formatNpr(d.amount)}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [list, setList] = useState<AdminCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [tab, setTab] = useState<"Pending" | "Active" | "Rejected">("Pending");

  const fetchList = () => {
    setLoading(true);
    Promise.all([
      adminApi.stats(),
      adminApi.campaigns(tab),
    ]).then(([s, c]) => {
      setStats(s.data);
      setList(c.data);
    }).catch(() => {}).finally(() => setLoading(false));
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

  if (loading) return <div className="mt-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const tabs = ["Pending", "Active", "Rejected"] as const;

  return (
    <div className="mt-8 space-y-10">
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Stat label="Total campaigns" value={String(stats.totalCampaigns)} icon={ShieldCheck} />
          <Stat label="Active campaigns" value={String(stats.activeCampaigns)} icon={TrendingUp} />
          <Stat label="Total donors" value={String(stats.totalDonors)} icon={Users} />
          <Stat label="Total raised" value={formatNpr(stats.totalRaised)} icon={Wallet} />
        </div>
      )}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">Campaign review queue</h2>
          <div className="flex gap-2">
            {tabs.map(t => (
              <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize ${tab === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{t.toLowerCase()}</button>
            ))}
          </div>
        </div>
        {list.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">Nothing here yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {list.map(c => (
              <div key={c.slug} className="grid gap-4 rounded-2xl border border-border bg-card p-5 md:grid-cols-[160px_1fr_auto]">
                {c.images && c.images.length > 0
                  ? <img src={resolveImageUrl(c.images[0])} alt="" className="h-28 w-full rounded-lg object-cover" />
                  : c.coverImage && <img src={resolveImageUrl(c.coverImage)} alt="" className="h-28 w-full rounded-lg object-cover" />
                }
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
      </section>
    </div>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      </div>
      <p className="mt-2 font-display text-2xl font-bold text-primary">{value}</p>
    </div>
  );
}
