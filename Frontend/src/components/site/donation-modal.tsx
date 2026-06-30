import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Wallet } from "lucide-react";
import { donationsApi, formatNpr } from "@/lib/api";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignSlug: string;
  campaignTitle: string;
}

export function DonationModal({ open, onOpenChange, campaignSlug, campaignTitle }: Props) {
  const [amount, setAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDonate = async () => {
    const num = Number(amount);
    if (!amount || isNaN(num) || num < 10) {
      setError("Minimum donation is NPR 10");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await donationsApi.create({
        campaignSlug,
        amount: num,
        donorName: donorName.trim() || undefined,
        message: message.trim() || undefined,
        paymentMethod: "eSewa",
      });

      if (!res.success || !res.data) {
        setError(res.message || "Failed to create donation");
        setLoading(false);
        return;
      }

      const payRes = await donationsApi.getEsewaPayment(res.data.id);
      if (!payRes.success || !payRes.data) {
        setError("Failed to initiate eSewa payment");
        setLoading(false);
        return;
      }

      const p = payRes.data;
      const form = document.createElement("form");
      form.method = "POST";
      form.action = p.paymentUrl;
      form.style.display = "none";

      const fields: Record<string, string> = {
        amount: String(p.amount),
        tax_amount: String(p.taxAmount),
        total_amount: String(p.totalAmount),
        transaction_uuid: p.transactionUuid,
        product_code: p.productCode,
        product_service_charge: "0",
        product_delivery_charge: "0",
        success_url: p.successUrl,
        failure_url: p.failureUrl,
        signed_field_names: p.signedFieldNames,
        signature: p.signature,
      };

      Object.entries(fields).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Make a donation</DialogTitle>
          <DialogDescription>
            Support <strong>{campaignTitle}</strong> via eSewa
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount (NPR)</Label>
            <Input
              id="amount"
              type="number"
              min="10"
              placeholder="e.g. 500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="name">Your name (optional)</Label>
            <Input
              id="name"
              placeholder="e.g. Bijaya Tiwari"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="message">Message (optional)</Label>
            <Input
              id="message"
              placeholder="e.g. Stay strong!"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            size="lg"
            className="w-full rounded-full"
            onClick={handleDonate}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wallet className="mr-2 h-4 w-4" />
            )}
            {loading ? "Redirecting to eSewa..." : `Donate ${amount ? formatNpr(Number(amount)) : ""}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
