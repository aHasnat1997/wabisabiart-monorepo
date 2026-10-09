"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import { connectStripe } from "./action";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

export default function Onboarding() {
  const [loading, setLoading] = useState(false);

  const handleConnectStripe = async () => {
    const completeUrl = `${window.location.origin}/seller-dashboard?onboarding-success-modal=onboarding-success`;
    const refreshUrl = `${window.location.origin}/seller-dashboard?onboarding-refresh-modal=onboarding-refresh`;
    setLoading(true);
    try {
      const url = await connectStripe(completeUrl, refreshUrl);
      console.log(url);
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[80vh] flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md text-center shadow-sm">
        <CardContent className="pt-10 pb-8 px-8 flex flex-col items-center gap-5">
          {/* Icon cluster */}
          <div className="relative flex items-center justify-center mb-2">
            {/* Glow ring */}
            <span className="absolute h-20 w-20 rounded-full bg-primary/10 animate-ping animation-duration-[2.5s]" />

            {/* Main icon */}
            <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CreditCard className="h-7 w-7 text-primary" />
            </span>

            {/* Security badge */}
            <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-background border border-border shadow-sm">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-1.5">
            <h1 className="text-lg font-semibold tracking-tight">
              Connect Your Stripe Account
            </h1>

            <p className="text-sm text-muted-foreground leading-relaxed">
              To start receiving payments from customers, connect your Stripe
              account securely. It only takes a few minutes to complete the
              onboarding process.
            </p>
          </div>

          {/* Benefits */}
          <div className="w-full rounded-xl border bg-muted/40 p-4 text-left space-y-3">
            <div className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-500 shrink-0" />
              <span>Receive payments directly to your bank account</span>
            </div>

            <div className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-500 shrink-0" />
              <span>
                Secure and trusted payment processing powered by Stripe
              </span>
            </div>

            <div className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-500 shrink-0" />
              <span>Required to activate your seller shop</span>
            </div>
          </div>

          {/* Status pill */}
          <div className="flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
            Stripe Onboarding Required
          </div>

          {/* Divider */}
          <div className="w-full border-t border-border" />

          {/* CTA */}
          <Button className="w-full gap-2" onClick={handleConnectStripe}>
            Connect Stripe {loading ? <Spinner /> : <ArrowRight />}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
