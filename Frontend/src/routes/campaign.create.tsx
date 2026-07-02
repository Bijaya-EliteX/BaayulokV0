import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Check, Loader2 } from "lucide-react";
import { FileUpload, type UploadedFile } from "@/components/site/file-upload";
import { categoriesApi, campaignsApi, uploadApi, getStoredUser } from "@/lib/api";
import { nepalProvinces } from "@/lib/nepal-locations";

export const Route = createFileRoute("/campaign/create")({
  beforeLoad: () => {
    const user = getStoredUser();
    if (!user) {
      sessionStorage.setItem("openAuthModal", "1");
      throw redirect({ to: "/" });
    }
  },
  head: () => ({ meta: [{ title: "Start a Campaign — BaayuLok" }] }),
  component: Page,
});

const steps = ["Basics", "Story", "Beneficiary", "Documents", "Review"];

function Required({ children }: { children: React.ReactNode }) {
  return <span>{children} <span className="text-destructive">*</span></span>;
}

function Page() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<{ name: string }[]>([]);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [goal, setGoal] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [story, setStory] = useState("");
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [hospital, setHospital] = useState("");

  const [cover, setCover] = useState<UploadedFile[]>([]);
  const [citizenship, setCitizenship] = useState<UploadedFile[]>([]);
  const [hospitalLetter, setHospitalLetter] = useState<UploadedFile[]>([]);
  const [medicalBills, setMedicalBills] = useState<UploadedFile[]>([]);

  useEffect(() => {
    categoriesApi.list().then(r => setCategories(r.data)).catch(() => {});
  }, []);

  const districts = nepalProvinces.find((p) => p.name === province)?.districts ?? [];
  const totalDocs = citizenship.length + hospitalLetter.length + medicalBills.length;

  function canAdvance(fromStep: number): boolean {
    switch (fromStep) {
      case 0: return !!title && !!category && !!goal && !!province && !!district;
      case 1: return !!story && cover.length > 0;
      case 2: return !!beneficiaryName && !!relationship && !!hospital;
      case 3: return citizenship.length > 0 && hospitalLetter.length > 0;
      default: return true;
    }
  }

  const handleContinue = () => {
    if (!canAdvance(step)) return;
    setStep(s => Math.min(steps.length - 1, s + 1));
  };

  const handleSubmit = async () => {
    setError("");
    setSubmitting(true);
    try {
      const allUploads = await Promise.all([
        ...cover.map(d => uploadApi.file(d.file)),
        uploadApi.file(citizenship[0].file),
        uploadApi.file(hospitalLetter[0].file),
        ...(medicalBills.length > 0 ? medicalBills.map(d => uploadApi.file(d.file)) : []),
      ]);
      const imgCount = cover.length;
      const coverImages = allUploads.slice(0, imgCount);
      const citizenshipUrl = allUploads[imgCount];
      const hospitalLetterUrl = allUploads[imgCount + 1];
      const medicalBillsUrls = allUploads.slice(imgCount + 2);

      const res = await campaignsApi.create({
        title,
        category,
        goal: Number(goal),
        province,
        district,
        beneficiaryName,
        relationship,
        hospital,
        story,
        coverImages,
        citizenshipUrl,
        hospitalLetterUrl,
        medicalBillsUrls: medicalBillsUrls.length > 0 ? medicalBillsUrls : undefined,
      });
      navigate({ to: "/campaign/$slug", params: { slug: res.data.slug } });
    } catch (err: any) {
      setError(err.message || "Failed to create campaign");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <h1 className="font-display text-4xl font-bold">Start a medical campaign</h1>
      <p className="mt-2 text-muted-foreground">Tell us your story. Our team will verify your medical documents within 48 hours.</p>
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
          <Field label={<Required>Campaign title</Required>}><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Help Aarav get heart surgery" /></Field>
          <Field label={<Required>Medical category</Required>}>
            <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="" disabled>Select category</option>
              {categories.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </Field>
          <Field label={<Required>Goal (NPR)</Required>}><Input value={goal} onChange={(e) => setGoal(e.target.value)} type="number" placeholder="500000" /></Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={<Required>Province</Required>}>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={province}
                onChange={(e) => { setProvince(e.target.value); setDistrict(""); }}
              >
                <option value="" disabled>Select province</option>
                {nepalProvinces.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
              </select>
            </Field>
            <Field label={<Required>District</Required>}>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                disabled={!province}
              >
                <option value="" disabled>{province ? "Select district" : "Select province first"}</option>
                {districts.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
          </div>
        </>}
        {step === 1 && <>
          <Field label={<Required>Your story</Required>}><Textarea value={story} onChange={(e) => setStory(e.target.value)} rows={8} placeholder="Tell donors who you're raising for, their diagnosis, and the treatment needed…" /></Field>
          <Field label={<Required>Cover images</Required>}>
            <FileUpload kind="image" multiple files={cover} onChange={setCover} maxSizeMb={8} hint="Upload one or more photos of the patient · JPG, PNG, WebP · up to 8 MB each" />
          </Field>
        </>}
        {step === 2 && <>
          <Field label={<Required>Beneficiary (patient) full name</Required>}><Input value={beneficiaryName} onChange={(e) => setBeneficiaryName(e.target.value)} /></Field>
          <Field label={<Required>Relationship to patient</Required>}><Input value={relationship} onChange={(e) => setRelationship(e.target.value)} placeholder="Self / Parent / Child / Friend" /></Field>
          <Field label={<Required>Hospital / treating institution</Required>}><Input value={hospital} onChange={(e) => setHospital(e.target.value)} /></Field>
        </>}
        {step === 3 && <>
          <p className="text-sm text-muted-foreground">Upload supporting documents. PDF, DOC, JPG or PNG accepted (up to 10 MB each). These are reviewed privately by our verification team.</p>
          <Field label={<Required>Citizenship document</Required>}>
            <FileUpload kind="document" files={citizenship} onChange={setCitizenship} />
          </Field>
          <Field label={<Required>Hospital letter / diagnosis report</Required>}>
            <FileUpload kind="document" multiple files={hospitalLetter} onChange={setHospitalLetter} hint="Doctor's letter, diagnosis or treatment plan · multiple files allowed" />
          </Field>
          <Field label="Medical bills / cost estimate (optional)">
            <FileUpload kind="document" multiple files={medicalBills} onChange={setMedicalBills} hint="Hospital bills or cost estimates · multiple files allowed" />
          </Field>
        </>}
        {step === 4 && (
          <div className="text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary"><Check className="h-7 w-7" /></div>
            <h3 className="mt-4 font-display text-2xl font-bold">Ready to submit</h3>
            <p className="mt-2 text-muted-foreground">We'll review your documents and notify you within 48 hours.</p>
            <div className="mx-auto mt-6 max-w-xs space-y-2 text-left text-sm">
              <SummaryRow label="Title" value={title} ok={!!title} />
              <SummaryRow label="Cover images" value={`${cover.length} image${cover.length === 1 ? "" : "s"}`} ok={cover.length > 0} />
              <SummaryRow label="Citizenship" value={`${citizenship.length} file${citizenship.length === 1 ? "" : "s"}`} ok={citizenship.length > 0} />
              <SummaryRow label="Hospital letter" value={`${hospitalLetter.length} file${hospitalLetter.length === 1 ? "" : "s"}`} ok={hospitalLetter.length > 0} />
              <SummaryRow label="Medical bills" value={`${medicalBills.length} file${medicalBills.length === 1 ? "" : "s"}`} ok={medicalBills.length > 0} />
            </div>
            {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
          </div>
        )}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>Back</Button>
          {step < steps.length - 1
            ? <Button onClick={handleContinue}>Continue</Button>
            : <Button className="bg-primary" disabled={submitting || totalDocs === 0 || cover.length === 0} onClick={handleSubmit}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Submit for review
              </Button>}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return <div className="space-y-2"><Label className="text-sm font-medium">{label}</Label>{children}</div>;
}

function SummaryRow({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className={`flex items-center gap-1.5 font-medium ${ok ? "text-primary" : "text-muted-foreground"}`}>
        {ok && <Check className="h-3.5 w-3.5" />}{value}
      </span>
    </div>
  );
}
