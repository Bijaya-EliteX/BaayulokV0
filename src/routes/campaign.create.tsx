import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";

export const Route = createFileRoute("/campaign/create")({
  head: () => ({ meta: [{ title: "Start a Campaign — BaayuLok" }] }),
  component: Page,
});

const steps = ["Basics", "Story", "Beneficiary", "Documents", "Review"];

function Page() {
  const [step, setStep] = useState(0);
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <h1 className="font-display text-4xl font-bold">Start a campaign</h1>
      <p className="mt-2 text-muted-foreground">Tell us your story. Our team will verify your documents within 48 hours.</p>
      <div className="mt-8 flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex flex-1 items-center gap-2">
            <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-semibold ${i <= step ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            {i < steps.length - 1 && <div className={`h-0.5 flex-1 ${i < step ? "bg-primary" : "bg-border"}`} />}
          </div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-5 text-center text-[11px] font-medium text-muted-foreground">
        {steps.map((s) => <p key={s}>{s}</p>)}
      </div>

      <div className="mt-10 space-y-5 rounded-3xl border border-border bg-card p-8">
        {step === 0 && <>
          <Field label="Campaign title"><Input placeholder="e.g. Help Aarav fight cancer" /></Field>
          <Field label="Category"><select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option>Medical</option><option>Education</option><option>Disaster Relief</option><option>Community</option></select></Field>
          <Field label="Goal (NPR)"><Input type="number" placeholder="500000" /></Field>
          <Field label="Location"><Input placeholder="District, Province" /></Field>
        </>}
        {step === 1 && <>
          <Field label="Your story"><Textarea rows={8} placeholder="Tell donors who you're raising for and why this matters…" /></Field>
          <Field label="Cover image"><div className="grid h-32 place-items-center rounded-md border border-dashed border-border text-sm text-muted-foreground">Drop image or click to upload</div></Field>
        </>}
        {step === 2 && <>
          <Field label="Beneficiary full name"><Input /></Field>
          <Field label="Relationship"><Input placeholder="Self / Parent / Friend" /></Field>
          <Field label="Hospital / Institution"><Input /></Field>
        </>}
        {step === 3 && <>
          <Field label="Citizenship document"><FileBox /></Field>
          <Field label="Hospital letter / supporting doc"><FileBox /></Field>
          <Field label="Medical bills (optional)"><FileBox /></Field>
        </>}
        {step === 4 && (
          <div className="text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary"><Check className="h-7 w-7" /></div>
            <h3 className="mt-4 font-display text-2xl font-bold">Ready to submit</h3>
            <p className="mt-2 text-muted-foreground">We'll review your documents and notify you within 48 hours.</p>
          </div>
        )}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>Back</Button>
          {step < steps.length - 1
            ? <Button onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))}>Continue</Button>
            : <Button className="bg-primary">Submit for review</Button>}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label className="text-sm font-medium">{label}</Label>{children}</div>;
}
function FileBox() {
  return <div className="grid h-20 place-items-center rounded-md border border-dashed border-border text-xs text-muted-foreground">Click to upload (PDF, JPG, PNG)</div>;
}