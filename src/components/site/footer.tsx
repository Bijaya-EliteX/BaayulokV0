import { Link } from "@tanstack/react-router";
import { Heart, Instagram, Facebook, Twitter, Youtube } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-[color:var(--ink)] text-background/90">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4 md:px-6">
        <div>
          <div className="flex items-center gap-2 font-display text-xl font-bold text-background">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-primary"><Heart className="h-4 w-4 fill-current" /></span>
            BaayuLok
          </div>
          <p className="mt-3 text-sm text-background/60">Every Hand Helps. Nepal's verified community crowdfunding platform.</p>
          <div className="mt-4 flex gap-3">
            {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
              <span key={i} className="grid h-9 w-9 place-items-center rounded-full border border-background/20 transition hover:bg-primary hover:border-primary"><Icon className="h-4 w-4" /></span>
            ))}
          </div>
        </div>
        <FooterCol title="Donate" links={[["All Campaigns", "/campaign/list"], ["Categories", "/categories"], ["Verified Causes", "/campaign/list"]]} />
        <FooterCol title="Fundraise" links={[["Start a Campaign", "/campaign/create"], ["How it Works", "/fundraise/how-it-works"], ["Tips & Resources", "/fundraise/tips-and-resources"]]} />
        <FooterCol title="Company" links={[["About", "/"], ["Trust & Safety", "/"], ["Contact", "/"]]} />
      </div>
      <div className="border-t border-background/10">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-background/50 md:px-6">© {new Date().getFullYear()} BaayuLok. Made with love in Nepal.</p>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-background">{title}</h4>
      <ul className="space-y-2 text-sm text-background/70">
        {links.map(([label, to]) => (
          <li key={label}><Link to={to} className="transition hover:text-background">{label}</Link></li>
        ))}
      </ul>
    </div>
  );
}