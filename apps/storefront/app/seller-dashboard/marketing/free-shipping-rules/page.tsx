import GlobalFreeShipping from "./components/GlobalShippingRules";
import ShippingRuleCard from "./components/ShippingRuleCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/animate-ui/components/buttons/button";
import Link from "next/link";
import { getGlobalShippingAddress, getListAllRules, getShippingStats } from "./components/shippingAction";

export const dynamic = "force-dynamic";

const FreeShippingRulesPage = async () => {
  let rules: any[] = [];
  let stats: Record<string, any> = {};
  let globalShipping: any = null;

  // try-catch block use kora hoyeche jate API fail korleo page crash na kore
  try {
    rules = (await getListAllRules()) || [];
    stats = (await getShippingStats()) || {};
    globalShipping = (await getGlobalShippingAddress()) || null;
  } catch (error) {
    console.error("Failed to fetch shipping data:", error);
  }

  return (
    <Card className="p-4 sm:p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-semibold">Free Shipping Rules</h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              {/* Optional chaining & default value use kora hoyeche */}
              {stats?.activeRules || 0} active rules · {stats?.totalFreeShippingOrders || 0} orders with free shipping
            </p>
          </div>

          {/* Create Rule Button */}
          <Link href="?shipping-rules-modal=shipping-rules">
            <Button className="bg-primary cursor-pointer text-card">
              + Add Rule
            </Button>
          </Link>
        </div>

        {/* Global Shipping (Checking if data exists) */}
        {globalShipping ? (
          <GlobalFreeShipping shipping={globalShipping} />
        ) : (
          <p className="text-sm text-muted-foreground">No global shipping address set.</p>
        )}

        {/* Custom Rules */}
        <div className="space-y-3">
          <h3 className="text-sm sm:text-base font-medium">Custom Shipping Rules</h3>

          <div className="space-y-2">
            {/* Safe array length check */}
            {rules?.length > 0 ? (
              rules.map((rule) => (
                <ShippingRuleCard key={rule.id} rule={rule} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center border rounded-lg border-dashed">
                No custom shipping rules found.
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default FreeShippingRulesPage;