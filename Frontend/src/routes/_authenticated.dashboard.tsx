import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { usersApi, formatNpr, type UserCampaign, type UserDonation, type DashboardStats } from "@/lib/api";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { FileUpload, type UploadedFile } from "@/components/site/file-upload";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — BaayuLok" }] }),
  component: Page,
});

function Page() {
  const { user } = useAuth();
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
      <div>
        {/* <h1 className="font-display text-3xl font-bold">Welcome back, {user?.fullName ?? "User"} 👋</h1> */}
        {/* <p className="text-muted-foreground">Here's how your campaigns and donations are doing.</p> */}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Total raised" value={stats ? formatNpr(stats.totalRaised) : "NPR 0"} />
        <Stat label="Active campaigns" value={stats ? String(stats.activeCampaigns) : "0"} />
        <Stat label="Lifetime donated" value={stats ? formatNpr(stats.lifetimeDonated) : "NPR 0"} />
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
      <KycSection />
    </div>
  );
}

function KycSection() {
  const [docs, setDocs] = useState<UploadedFile[]>([]);
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="font-display text-xl font-bold">KYC status</h2>
      <p className="mt-2 text-sm text-muted-foreground">Your documents are verified. Re-upload updated medical documents below if anything has changed.</p>
      <div className="mt-4 max-w-lg">
        <FileUpload kind="document" multiple files={docs} onChange={setDocs} hint="Citizenship, hospital letters or medical bills · PDF, DOC, JPG, PNG" />
      </div>
      {docs.length > 0 && (
        <Button className="mt-4">Submit {docs.length} document{docs.length === 1 ? "" : "s"} for re-verification</Button>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold text-primary">{value}</p>
    </div>
  );
}
