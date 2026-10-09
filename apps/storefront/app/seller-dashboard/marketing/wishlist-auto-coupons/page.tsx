"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Loader2, Tag } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getActivityFeed,
  getWishlistConfig,
  getWishlistConfigStats,
  toggleWishlistConfig,
  updateWishlistConfig,
  WishlistActivity,
  WishlistConfig,
  WishlistStats,
} from "./components/wishlistAction";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";


export default function WishlistAutoCoupons() {
  const [config, setConfig] = useState<WishlistConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<WishlistActivity[]>([]);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<WishlistStats | null>(null);

  useEffect(() => {
    getWishlistConfig()
      .then((data) => setConfig(data))
      .finally(() => setLoading(false));
  }, []);

 useEffect(() => {
    
    Promise.all([
      getWishlistConfig(), 
      getWishlistConfigStats(), 
      getActivityFeed()
    ])
      .then(([configData, statsData, activityData]) => {
        setConfig(configData);
        setStats(statsData);
        setActivities(activityData);
      })
      .catch(() => toast.error("Failed to sync data"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!config) return;

    try {
      setSaving(true);

      const payload = {
        isEnabled: config.isEnabled,
        discountPercentage: Number(config.discountPercentage),
        validityDays: Number(config.validityDays),
        sendEmailNotification: config.sendEmailNotification,
        autoApplyAtCheckout: config.autoApplyAtCheckout,
      };

      console.log("Final Payload to API:", payload);

      const res = await updateWishlistConfig(payload);

      if (res && typeof res === "object" && "success" in res && res.success) {
        toast.success("Settings updated successfully!");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save. Ensure inputs are valid numbers.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (val: boolean) => {
    try {
      setSaving(true);

      const res = await toggleWishlistConfig({ isEnabled: val });

      if (res && typeof res === "object" && "success" in res && res.success) {
        setConfig((prev) => (prev ? { ...prev, isEnabled: val } : null));
        toast.success(`Wishlist coupons ${val ? "enabled" : "disabled"}`);
      }
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setSaving(false);
    }
  };
  if (loading)
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="md:p-6 p-2 space-y-6">
      {/* Header Card */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">Wishlist Auto-Coupons</CardTitle>
            <p className="text-sm text-muted-foreground">
              Automatically reward customers who wishlist your products
            </p>
          </div>
          <Switch
            checked={config?.isEnabled}
            onCheckedChange={handleToggleStatus}
            disabled={saving}
          />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* How it works UI... (same as before) */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Discount Percentage</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={config?.discountPercentage}
                  onChange={(e) =>
                    setConfig((prev) =>
                      prev
                        ? {
                            ...prev,
                            discountPercentage: Number(e.target.value),
                          }
                        : null,
                    )
                  }
                />
                <span className="text-sm">%</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Coupon Validity Period</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={config?.validityDays}
                  onChange={(e) =>
                    setConfig((prev) =>
                      prev
                        ? { ...prev, validityDays: Number(e.target.value) }
                        : null,
                    )
                  }
                />
                <span className="text-sm">days</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center bg-primary-foreground p-4 rounded-2xl border justify-between">
              <div>
                <p className="font-medium">Email Notification</p>
                <p className="text-sm text-muted-foreground">
                  Send email to customer when coupon is generated
                </p>
              </div>
              <Switch
                checked={config?.isEnabled}
                onCheckedChange={handleToggleStatus}
                disabled={saving}
              />
            </div>
            <div className="flex items-center bg-primary-foreground p-4 rounded-2xl border justify-between">
              <div>
                <p className="font-medium">Auto-Apply at Checkout</p>
                <p className="text-sm text-muted-foreground">
                  Automatically apply coupon when customer checks out
                </p>
              </div>
              <Switch
                checked={config?.isEnabled}
                onCheckedChange={handleToggleStatus}
                disabled={saving}
              />
            </div>
          </div>

          <Button
            className="w-full rounded-xl"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              "Save Settings"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Wishlisted Items</p>
            <p className="text-2xl font-semibold">{stats?.wishlistedItems || 0}</p>
            <p className="text-xs text-primary">Total items in wishlists</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Coupons Generated</p>
            <p className="text-2xl font-semibold">{stats?.couponsGenerated || 0}</p>
            <p className="text-xs text-primary">{stats?.generationRate} generation rate</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Coupons Redeemed</p>
            <p className="text-2xl font-semibold">{stats?.couponsRedeemed || 0}</p>
            <p className="text-xs text-primary">{stats?.redemptionRate} redemption rate</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Revenue Generated</p>
            <p className="text-2xl font-semibold">${stats?.revenueGenerated || 0}</p>
            <p className="text-xs text-primary">From wishlisted coupons</p>
          </CardContent>
        </Card>
        
      </div>

      {/* Recent Activity */}
     <Card className="rounded-2xl shadow-sm border-primary/10">
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-transparent hover:border-primary/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    {activity.type === "order" ? (
                      <CheckCircle className="w-4 h-4 text-primary" />
                    ) : (
                      <Tag className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.description} • ${activity.amount}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground text-sm">
              No recent activity found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
