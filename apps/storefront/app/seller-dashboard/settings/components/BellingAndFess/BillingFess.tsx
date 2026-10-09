"use client";

import { Button } from "@/components/animate-ui/components/buttons/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Box, Check, PanelTop, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getbillingAndFees } from "../SecurityAction";
import { BillingFeesData } from "@/types/sellerDashboard/Settings";

const fmt = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

export default function BillingFees() {
  const [data, setData] = useState<BillingFeesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [calcPrice, setCalcPrice] = useState<number>(100);

 useEffect(() => {
    const fetchBilling = async () => {
      const res = await getbillingAndFees();
      if (res?.success) setData(res.data);
      setLoading(false);
    };
    fetchBilling();
  }, []);

  

  // --- Calculation Logic (Dynamic from API) ---
  const calculations = useMemo(() => {
    const pFeePercent = parseFloat(data?.platformFeePercent || "0");
    const procPercent = parseFloat(data?.paymentProcessingPercent || "0");
    const procFlat = parseFloat(data?.paymentProcessingFlat || "0");

    const platformFeeAmount = (calcPrice * pFeePercent) / 100;
    const processingFeeAmount = (calcPrice * procPercent) / 100 + procFlat;
    const youReceive = calcPrice - (platformFeeAmount + processingFeeAmount);

    return { platformFeeAmount, processingFeeAmount, youReceive, pFeePercent, procPercent, procFlat };
  }, [calcPrice, data]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-3">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
        <p className="text-muted-foreground animate-pulse text-sm">Fetching billing structure...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Fee Summary */}
      <Card className="bg-primary text-card border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Your Fee Structure</CardTitle>
          <CardDescription className="text-card/70">
            Everything you need to know about platform costs and payouts
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8">
          <StatBox label="Platform Fee" value={`${data?.platformFeePercent}%`} sub="Per Transaction" />
          <StatBox label="Payment Processing" value={`${data?.paymentProcessingPercent}% + $${data?.paymentProcessingFlat}`} sub="Industry Standard" />
          <StatBox label="Net Share" value={`~${data?.sellerKeepsPercent}%`} sub="Of Total Sale" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fee Calculator */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center gap-3 border-b mb-4">
            <PanelTop className="text-primary" />
            <CardTitle className="text-lg">Fee Calculator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="product" className="text-muted-foreground">List Price ($)</Label>
              <Input
                id="product"
                type="number"
                value={calcPrice}
                onChange={(e) => setCalcPrice(Math.max(0, Number(e.target.value)))}
                className="bg-muted text-lg h-12 font-medium"
              />
            </div>
            <div className="space-y-3 bg-accent/30 p-4 rounded-xl">
              <Row label="Selling Price" value={fmt(calcPrice)} />
              <Row label={`Platform Fee (${calculations.pFeePercent}%)`} value={`-${fmt(calculations.platformFeeAmount)}`} negative />
              <Row label="Processing Fee" value={`-${fmt(calculations.processingFeeAmount)}`} negative />
              <Separator className="my-2" />
              <Row label="Expected Payout" value={fmt(calculations.youReceive)} highlight />
            </div>
            <div className="p-4 bg-chart-2/10 border border-chart-2/20 rounded-xl flex items-center gap-3">
               <Check className="text-chart-2 shrink-0" size={20} />
               <p className="text-sm font-medium">{data?.sellerKeepsPercent}% of this sale goes directly to your balance!</p>
            </div>
          </CardContent>
        </Card>

        {/* What's Included (Static Design) */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center gap-3 border-b mb-4">
            <Box className="text-chart-4" />
            <CardTitle className="text-lg">What&apos;s Included</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <FeatureItem title="Secure Payments" desc="SSL encryption & 24/7 fraud monitoring" />
            <FeatureItem title="Seller Analytics" desc="Real-time sales tracking & customer insights" />
            <FeatureItem title="Global Marketing" desc="Your products featured in SEO & social campaigns" />
            <FeatureItem title="Cloud Infrastructure" desc="High-speed hosting for your store images & data" />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Recent Commissions (Static Data with your Design) */}
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center gap-3">
            <PanelTop className="text-primary shrink-0" />
            <CardTitle className="text-base sm:text-lg">Recent Commission Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { id: 1, name: "Handwoven Indigo Scarf", date: "Dec 1, 2024", received: 82.58, salePrice: 90.0, platformFee: 5.0, processingFee: 3.2 },
              { id: 2, name: "Brass Ring Set", date: "Nov 28, 2024", received: 77.98, salePrice: 85.0, platformFee: 5.0, processingFee: 3.2 },
              { id: 3, name: "Ceramic Bowl", date: "Nov 25, 2024", received: 110.22, salePrice: 120.0, platformFee: 5.0, processingFee: 3.2 },
            ].map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-accent-foreground p-3 sm:p-4 rounded-xl">
                <div className="space-y-1">
                  <p className="font-medium text-sm sm:text-base">{item.name}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{item.date}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Sale Price: ${item.salePrice}</p>
                </div>
                <div className="text-left sm:text-right space-y-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">Platform Fee: -${item.platformFee}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Processing Fee: -${item.processingFee}</p>
                  <p className="text-xs sm:text-sm font-medium text-chart-2">Received: ${item.received}</p>
                </div>
              </div>
            ))}
            <Button className="w-full mt-4 bg-accent-foreground text-muted-foreground">View Full History</Button>
          </CardContent>
        </Card>

        {/* Payout Settings (Static Data with your Design) */}
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center gap-3">
            <PanelTop className="text-primary shrink-0" />
            <CardTitle className="text-base sm:text-lg">Payout Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pay">Payout Schedule</Label>
              <Input id="pay" defaultValue="Weekly (Every Monday)" className="bg-muted h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Minimum Payout Amount</Label>
              <Input id="amount" defaultValue="$25" className="bg-muted h-11" />
            </div>
            <div className="p-3 sm:p-4 rounded-xl bg-chart-1/20 flex flex-col sm:flex-row sm:justify-between gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Next Payout</p>
                <p className="text-muted-foreground">Amount</p>
              </div>
              <div className="sm:text-right font-medium">
                <p>Monday, Dec 9</p>
                <p>$1,847.23</p>
              </div>
            </div>
            <Button className="bg-chart-1 w-full">Update Payout Settings</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// --- Helper for Rows (Design Unchanged) ---
function StatBox({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-card/10 border border-card/20 rounded-2xl p-5 backdrop-blur-sm">
      <p className="text-xs uppercase tracking-wider text-card/60 font-semibold mb-1">{label}</p>
      <h3 className="text-3xl font-bold mb-1">{value}</h3>
      <p className="text-xs text-card/50">{sub}</p>
    </div>
  );
}

function Row({ label, value, negative, highlight }: { label: string; value: string; negative?: boolean; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center py-0.5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`font-semibold ${negative ? "text-destructive" : highlight ? "text-chart-2 text-lg" : "text-foreground"}`}>
        {value}
      </p>
    </div>
  );
}

function FeatureItem({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex gap-4 items-start group">
      <div className="mt-1 bg-chart-2/10 p-1 rounded-full group-hover:bg-chart-2/20 transition-colors">
        <Check className="text-chart-2" size={16} />
      </div>
      <div className="space-y-0.5">
        <h4 className="text-sm font-semibold">{title}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}