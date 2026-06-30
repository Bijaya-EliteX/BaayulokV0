import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { donationsApi } from "@/lib/api";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

export const Route = createFileRoute("/donate/success")({
  head: () => ({ meta: [{ title: "Thank you! — BaayuLok" }] }),
  validateSearch: (search: Record<string, string>) => ({
    refId: search.refId,
    oid: search.oid,
  }),
  component: SuccessPage,
});

function SuccessPage() {
  const { refId, oid } = useSearch({ from: "/donate/success" });
  const [status, setStatus] = useState<"verifying" | "success" | "failed">("verifying");

  useEffect(() => {
    if (!refId || !oid) {
      setStatus("failed");
      return;
    }

    donationsApi.verifyEsewaPayment(oid, refId)
      .then((res) => setStatus(res.success ? "success" : "failed"))
      .catch(() => setStatus("failed"));
  }, [refId, oid]);

  if (status === "verifying") {
    return (
      <div className="mx-auto grid min-h-[70vh] max-w-md place-items-center px-4 text-center">
        <div>
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
          <h1 className="mt-6 font-display text-3xl font-bold">Verifying payment...</h1>
          <p className="mt-2 text-muted-foreground">Please wait while we confirm your transaction with eSewa.</p>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="mx-auto grid min-h-[70vh] max-w-md place-items-center px-4 text-center">
        <div>
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-destructive/10 text-destructive"><XCircle className="h-10 w-10" /></div>
          <h1 className="mt-6 font-display text-4xl font-bold">Verification failed</h1>
          <p className="mt-2 text-muted-foreground">We couldn't verify your payment. If the amount was deducted, please contact support.</p>
          <Link to="/campaign/list"><Button className="mt-6 rounded-full">Browse campaigns</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid min-h-[70vh] max-w-md place-items-center px-4 text-center">
      <div>
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-primary/10 text-primary"><CheckCircle2 className="h-10 w-10" /></div>
        <h1 className="mt-6 font-display text-4xl font-bold">Donation received!</h1>
        <p className="mt-2 text-muted-foreground">Thank you for being a helping hand. Your contribution has been recorded.</p>
        <Link to="/campaign/list"><Button className="mt-6 rounded-full">Discover more campaigns</Button></Link>
      </div>
    </div>
  );
}
