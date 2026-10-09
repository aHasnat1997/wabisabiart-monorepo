"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Clock, Store, ArrowLeft } from "lucide-react";

const ShopPendingPage = () => {
  const router = useRouter();

  return (
    <div className="h-[80vh] flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md text-center shadow-sm">
        <CardContent className="pt-10 pb-8 px-8 flex flex-col items-center gap-5">
          {/* Icon cluster */}
          <div className="relative flex items-center justify-center mb-2">
            {/* Outer ring */}
            <span className="absolute h-20 w-20 rounded-full bg-chart-8/10 animate-ping animation-duration-[2.5s]" />
            <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-chart-8/15">
              <Store className="h-7 w-7 text-chart-8" />
            </span>

            {/* Clock badge */}
            <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-background border border-border shadow-sm">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-1.5">
            <h1 className="text-lg font-semibold tracking-tight">
              Shop Request Pending
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your shop creation request has been submitted and is currently
              waiting for approval by an admin. You&apos;ll be notified once
              it&apos;s reviewed.
            </p>
          </div>

          {/* Status pill */}
          <div className="flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            Awaiting Admin Approval
          </div>

          {/* Divider */}
          <div className="w-full border-t border-border" />

          {/* CTA */}
          <Button
            variant="default"
            className="w-full gap-2"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="h-4 w-4" />
            Go to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShopPendingPage;
