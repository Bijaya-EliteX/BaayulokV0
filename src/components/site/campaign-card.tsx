import { Link } from "@tanstack/react-router";
import { MapPin, ShieldCheck } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { formatNpr, type Campaign } from "@/lib/mock-data";

export function CampaignCard({ c }: { c: Campaign }) {
  const pct = Math.min(100, Math.round((c.raised / c.goal) * 100));
  return (
    <Link
      to="/campaign/$slug"
      params={{ slug: c.slug }}
      className="group flex w-[320px] shrink-0 flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-xl md:w-auto"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img src={c.cover} alt={c.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <span className="absolute left-3 top-3 rounded-full bg-background/95 px-3 py-1 text-xs font-semibold text-primary">{c.category}</span>
        {c.verified && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground">
            <ShieldCheck className="h-3 w-3" /> Verified
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="line-clamp-2 font-display text-lg font-semibold leading-snug text-foreground">{c.title}</h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{c.location}</div>
        <Progress value={pct} className="h-2" />
        <div className="mt-auto flex items-end justify-between">
          <div>
            <p className="font-display text-lg font-bold text-primary">{formatNpr(c.raised)}</p>
            <p className="text-xs text-muted-foreground">raised of {formatNpr(c.goal)}</p>
          </div>
          <p className="text-xs font-medium text-muted-foreground">{c.donors} donors</p>
        </div>
      </div>
    </Link>
  );
}