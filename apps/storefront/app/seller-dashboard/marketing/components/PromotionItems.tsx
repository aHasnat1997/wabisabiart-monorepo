"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, Box } from "lucide-react";
import { PromotionItem } from "@/types/sellerDashboard/PromotionItems";
import Link from "next/link";
import { deletePromotion, togglePromotionStatus } from "./PromotionAction";
import { toast } from "sonner";
import PromotionDeleteButton from "./PromotionDeleteButton";

type Props = {
  promo: PromotionItem;
};

export default function PromotionCard({ promo }: Props) {
  // Local state for toggle
  const [status, setStatus] = useState(promo.status);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggle = async(checked: boolean) => {
    const newStatus = checked ? "Active" : "Inactive";
    const previousStatus = status; 
    setStatus(newStatus);
    setIsLoading(true);
    // Optionally, you can call an API here to update the backend

    try {
      
      await togglePromotionStatus(promo.id);
      toast.success(`Promotion is now ${newStatus.toLowerCase()}`);
    } catch (error) {
      
      setStatus(previousStatus);
      toast.error("Failed to update status. Please try again.");
    } finally {
      setIsLoading(false);
    }


  };

  // const handleDelete = async () => {
  //   // // User ke ekbar confirm korchi jate vul kore click porle delete na hoye jay
  //   // const confirmDelete = window.confirm("Are you sure you want to delete this promotion?");
  //   // if (!confirmDelete) return;

  //   setIsDeleting(true);
  //   try {
  //     await deletePromotion(promo.id);
  //     toast.success("Promotion deleted successfully!");
  //   } catch (error) {
  //     toast.error("Failed to delete promotion. Please try again.");
  //   } finally {
  //     setIsDeleting(false);
  //   }
  // };

  

  return (
    <div className="border rounded-lg md:p-4 p-2 bg-card shadow-sm flex flex-col justify-between">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex gap-2">
          <h3 className="font-semibold text-popover-foreground">
            {promo.title}
          </h3>
          <div className="hidden md:block">
            {status === "Active" && (
              <Badge className="mt-1 bg-primary/40 text-primary">Active</Badge>
            )}

            {status === "Inactive" && (
              <Badge className="mt-1 bg-muted-foreground/20 text-muted-foreground">
                Inactive
              </Badge>
            )}
          </div>
        </div>
        <Switch 
          checked={status === "Active"} 
          onCheckedChange={handleToggle} 
          disabled={isLoading}
        />
      </div>
      <div className="md:flex flex justify-between items-center gap-3">
       {promo.type === "Percentage" && (
          <Badge className="mt-1 bg-muted text-chart-4">{promo.type}</Badge>
        )}

        {promo.type === "Fixed" && (
          <Badge className="mt-1 bg-muted text-chart-8">{promo.type}</Badge>
        )}
        
        
         {promo.type === "BOGO" && (
          <Badge className="mt-1 bg-muted text-chart-2">{promo.type}</Badge>
        )}
        

        {/* Value */}
        <p className="text-lg text-primary font-bold mt-3">{promo.value}</p>
        <div className="md:hidden block">
          {status === "Active" && (
            <Badge className="mt-1 bg-primary/40 text-primary">Active</Badge>
          )}

          {status === "Inactive" && (
            <Badge className="mt-1 bg-muted-foreground/20 text-muted-foreground">
              Inactive
            </Badge>
          )}
        </div>
      </div>

      {/* Applied To */}
      <div className="mt-2 bg-muted rounded-2xl p-2">
        <div className="flex gap-2">
          <Box size={14} />
          <p className="text-xs text-muted-foreground font-medium">
            Applied to:
          </p>
        </div>
        <div className="flex flex-wrap gap-1 mt-1">
          {promo.appliedTo.map((item) => (
            <Badge key={item} variant="outline">
              {item}
            </Badge>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="flex mt-3 text-xs mb-2.5 text-muted-foreground">
        <div>
          <p>Uses</p>
          <p>{promo.uses}</p>
        </div>
        <div className="lg:ml-56 ml-28">
          <p>Revenue</p>
          <p>{promo.revenue}</p>
        </div>
      </div>

      <hr />

      {/* Period */}
      <p className="text-xs text-muted-foreground mt-2">{promo.period}</p>

      {/* Actions */}
      <div className="flex gap-4 mt-3">
        {/* Preview Button */}
        <div className="w-full">
          <Link href={`?preview-modal=preview&id=${promo.id}`}>
            <Button
              size="sm"
              variant="outline"
              className="flex items-center cursor-pointer lg:w-full md:w-4/5 gap-1"
            >
              <Eye className="h-4 w-4" />
              Preview
            </Button>
          </Link>
        </div>

        {/* edit Button */}

        <Link href={`?promotion-edit-modal=promotion-edit&id=${promo.id}`}>
          <Button className="cursor-pointer" variant="outline" size="sm">
            <Edit></Edit>
          </Button>
        </Link>

      <PromotionDeleteButton id={promo.id}></PromotionDeleteButton>
      </div>
    </div>
  );
}




{/* <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="flex items-center cursor-pointer text-destructive gap-1"
              disabled={isDeleting}
            >
              <Trash2 className={isDeleting ? "animate-pulse" : ""} />
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the 
                <span className="font-bold text-foreground"> {promo.title} </span> 
                promotion from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              
              <AlertDialogAction 
                onClick={(e) => {
                  e.preventDefault(); 
                  handleDelete();
                }}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Yes, delete it"}
              </AlertDialogAction>

            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog> */}
