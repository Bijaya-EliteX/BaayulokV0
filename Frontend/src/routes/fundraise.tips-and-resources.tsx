import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/fundraise/tips-and-resources")({
  head: () => ({ meta: [{ title: "Tips & Resources — BaayuLok" }] }),
  component: Page,
});

function Page() {
  const tips = [
    { t: "Write a story, not a plea", d: "Donors connect with people. Open with a single moment that shows who you're raising for." },
    { t: "Use real photos", d: "One honest photo of the beneficiary beats ten stock images. Always get consent first." },
    { t: "Update every week", d: "Campaigns that post updates raise 3× more on average. Share progress, setbacks, and thank-yous." },
    { t: "Share in the first 48 hours", d: "Most donations come from your immediate circle. Message friends and family directly." },
    { t: "Be transparent about costs", d: "Break down exactly what donations will pay for — hospital bills, equipment, tuition." },
    { t: "Respond to every donor", d: "A short thank-you message turns one-time donors into long-term supporters." },
  ];
  return (
    <div className="mx-auto max-w-5xl px-4 py-20 md:px-6">
      <h1 className="font-display text-5xl font-bold">Tips & resources</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">Six things every successful BaayuLok campaign does right.</p>
      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {tips.map((t, i) => (
          <div key={t.t} className="rounded-2xl border border-border bg-card p-6">
            <span className="font-display text-3xl font-bold text-primary/30">0{i + 1}</span>
            <h3 className="mt-2 font-display text-xl font-bold">{t.t}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}