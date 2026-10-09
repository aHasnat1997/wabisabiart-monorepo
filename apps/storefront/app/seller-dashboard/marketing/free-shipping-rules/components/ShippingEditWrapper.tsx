
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import ShippingRulesDialog from "./ShippingRulesDialog";

import { Loader2 } from "lucide-react";
import { getListAllRules } from "./shippingAction";
import { ApiShippingRule } from "@/types/sellerDashboard/FreeShippingRules";

export default function ShippingEditWrapper() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [rule, setRule] = useState<ApiShippingRule | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRule() {
      if (id) {
        setLoading(true);
        const rules = await getListAllRules();
        const foundRule = rules.find((r: ApiShippingRule) => r.id === id);
        setRule(foundRule || null);
        setLoading(false);
      }
    }
    fetchRule();
  }, [id]);

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
  if (!rule) return <p className="text-center p-10">Rule not found!</p>;

  return <ShippingRulesDialog mode="edit" initialData={rule} />;
}