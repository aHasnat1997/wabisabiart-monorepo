"use client";

import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {  ApiShippingRule} from "@/types/sellerDashboard/FreeShippingRules";
import { Edit, Loader2} from "lucide-react";
import { Button } from "@/components/animate-ui/components/buttons/button";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { updateToggleShipping } from "./shippingAction";
import ShippingDeleteButton from "./ShippingDeleteButton";

type Props = {
  rule: ApiShippingRule;
};

const ShippingRuleCard = ({ rule }: Props) => {
  const [isPending, setIsPending] = useState(false);

  const isActive = rule.isActive;

    const handleToggle = async () => {
    try {
      setIsPending(true);
      const response = await updateToggleShipping(rule.id);
      
      if (response && response.success) {
        toast.success(`Shipping ${isActive ? "deactivated" : "activated"} successfully`);
      } else {
        toast.error("Failed to change status");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsPending(false);
    }
  };

  //  const handleDelete = async () => {
  //     try {
  //       toast.loading("Deleting shiping...", { id: "delete-shipping" });
  //       const response = await deleteShippingCard(rule.id);
  
  //       if(response && response.success){
  //         toast.success("Shipping Card Delete Successfull", {id:"delete-shipping"})
  //       }else {
  //         toast.error("Failed to delete shipping", { id: "delete-shipping" });
  //       }
  //     } catch (error) {
  //       toast.error("Something went wrong while deleting", { id: "delete-shiping" });
  //     }
  //   }

  return (
    <>
      {/* Desktop Card */}
      <div className="hidden sm:flex items-center justify-between rounded-lg border px-4 py-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">{rule.name}</p>
            <Badge
              variant="secondary"
              className={
                isActive
                  ? "bg-primary/10 text-primary"
                  : "bg-muted-foreground/10 text-muted-foreground"
              }
            >
             {isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Min: ${rule.minimumOrderAmount} · {rule.region} · {rule.orderCount} orders
          </p>
        </div>

        <div className="flex items-center gap-3">
           
      {isPending && <Loader2 className="w-3 h-3  animate-spin text-muted-foreground" />}
      <Switch 

        checked={isActive} 
        onCheckedChange={handleToggle}
        disabled={isPending}
      />
          {/* <ShippingRulesDialog
            mode="edit"
            initialData={{
              name: rule.title,
              minOrderAmount: rule.minAmount,
              region: rule.region as ShippingRegion,
            }}
            trigger={
              <Button className="cursor-pointer bg-muted">
                <Edit className="h-4 w-4 text-muted-foreground" />
              </Button>
            }
          /> */}
  <Link href={`?shipping-rules-modal=shipping-rules-edit&id=${rule.id}`}>
  <Button variant="ghost" size="icon">
    <Edit size={20} />
  </Button>
</Link>
         <ShippingDeleteButton id={rule.id}></ShippingDeleteButton>
        </div>
      </div>

      {/* Mobile Card */}
      <div className="flex flex-col sm:hidden border rounded-lg p-4 gap-3 bg-card">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-sm font-medium">{rule.name}</p>
            <Badge
              variant="secondary"
              className={
               isActive
                  ? "bg-primary/10 text-primary"
                  : "bg-muted-foreground/10 text-muted-foreground"
              }
            >
              {isActive? "Active" : "Inactive"}
            </Badge>
          </div>
           {isPending && <Loader2 className="w-3 h-3  animate-spin text-muted-foreground" />}
      <Switch 

        checked={isActive} 
        onCheckedChange={handleToggle}
        disabled={isPending}
      />
        </div>

        <p className="text-xs text-muted-foreground">
          Min: ${rule.minimumOrderAmount} · {rule.region} · {rule.orderCount} orders
        </p>

        <div className="flex gap-3 justify-end">
          {/* <ShippingRulesDialog
            mode="edit"
            initialData={{
              name: rule.title,
              minOrderAmount: rule.minAmount,
              region: rule.region as ShippingRegion,
            }}
            trigger={
              <Button className="cursor-pointer bg-muted">
                <Edit className="h-4 w-4 text-muted-foreground" />
              </Button>
            }
          /> */}
           <Link href={`?shipping-rules-modal=shipping-rules-edit&id=${rule.id}`}>
  <Button variant="ghost" size="icon">
    <Edit size={20} />
  </Button>
</Link>
        <ShippingDeleteButton id={rule.id}></ShippingDeleteButton>
        </div>
      </div>
    </>
  );
};

export default ShippingRuleCard;
