"use client";

import { useCallback, useEffect, useState } from "react";
import { CreditCard as CardIcon, Trash2, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import Link from "next/link";
import SectionTitle from "@/components/SectionTitle";
import { PaymentMethod } from "@/types/cards";
import { deleteCard, getSavedCards } from "./action";
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/animate-ui/primitives/base/alert-dialog";

// Brand-tinted gradient so cards feel distinct without using trademarked logos.
const BRAND_STYLES: Record<string, { gradient: string; label: string }> = {
  visa: {
    gradient: "from-[#1A1F71] via-[#2540A6] to-[#1A1F71]",
    label: "VISA",
  },
  mastercard: {
    gradient: "from-[#2b2b2b] via-[#3a3a3a] to-[#1f1f1f]",
    label: "Mastercard",
  },
  amex: {
    gradient: "from-[#006FCF] via-[#0089D6] to-[#006FCF]",
    label: "AMEX",
  },
  discover: {
    gradient: "from-[#FF6000] via-[#f97316] to-[#c2410c]",
    label: "DISCOVER",
  },
  default: {
    gradient: "from-neutral-700 via-neutral-800 to-neutral-900",
    label: "CARD",
  },
};

function formatExpiry(month: number, year: number) {
  const mm = String(month).padStart(2, "0");
  const yy = String(year).slice(-2);
  return `${mm}/${yy}`;
}

function CardFace({
  pm,
  isRemoving,
  onRemove,
}: {
  pm: PaymentMethod;
  isRemoving?: boolean;
  onRemove: (id: string) => void;
}) {
  const style = BRAND_STYLES[pm.card.brand] ?? BRAND_STYLES.default;

  return (
    <div
      className={`relative aspect-video w-full flex flex-col justify-between group hover:scale-[1.03] hover:shadow-2xl duration-300 rounded-xl bg-linear-to-br ${style.gradient} p-6 text-white shadow-md overflow-hidden`}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -left-8 -bottom-12 h-36 w-36 rounded-full bg-white/5" />

      {/* Top row: brand + remove */}
      <div className="relative flex items-center justify-between">
        <span className="text-lg font-bold tracking-wide text-white/90">
          {style.label}
        </span>
        <AlertDialog>
          <AlertDialogTrigger>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Remove card"
              className="h-9 px-3 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 text-white/80 hover:bg-white/10 hover:text-white"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>

          <AlertDialogPortal>
            <AlertDialogBackdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
            <AlertDialogPopup
              className="sm:max-w-md fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] z-50
                 border bg-background p-6 rounded-md shadow-lg"
            >
              <AlertDialogHeader className="space-y-2">
                <AlertDialogTitle className="text-lg font-semibold text-destructive">
                  Remove this card?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-muted-foreground">
                  This will permanently remove the card ending in{" "}
                  {pm.card.last4} from your account. You&apos;ll need to re-add
                  it for future purchases.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter className="mt-6 flex justify-end gap-3">
                <AlertDialogClose className="px-4 py-2 cursor-pointer text-sm font-medium rounded-md border-secondary border hover:bg-muted/80 transition-colors">
                  Cancel
                </AlertDialogClose>
                <AlertDialogClose
                  onClick={() => onRemove(pm.id)}
                  className="px-4 py-2 text-sm cursor-pointer font-medium rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors flex items-center gap-1.5"
                >
                  Remove {isRemoving && <Spinner />}
                </AlertDialogClose>
              </AlertDialogFooter>
            </AlertDialogPopup>
          </AlertDialogPortal>
        </AlertDialog>
      </div>

      {/* Middle: card number, vertically centered between the two rows */}
      <div className="relative font-mono text-2xl tracking-[0.2em] whitespace-nowrap">
        •••• •••• •••• {pm.card.last4}
      </div>

      {/* Bottom row: pinned to the card's bottom edge via justify-between on the parent */}
      <div className="relative flex items-end justify-between">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wider text-white/60">
            Card holder
          </p>
          <p className="text-base font-semibold truncate max-w-40">
            {pm.billing_details.name || "—"}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs uppercase tracking-wider text-white/60">
            Expires
          </p>
          <p className="text-base font-semibold">
            {formatExpiry(pm.card.exp_month, pm.card.exp_year)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CreditCards() {
  const [savedCards, setSavedCards] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  const fetchSavedCards = useCallback(async () => {
    try {
      setIsLoading(true);
      const cards = await getSavedCards();
      setSavedCards(cards || []);
    } catch (error) {
      console.error("Error fetching saved cards:", error);
      toast.error("Failed to load saved cards");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSavedCards();
  }, [fetchSavedCards]);

  const handleRemove = async (pmId: string) => {
    setActingId(pmId);
    try {
      const res = await deleteCard(pmId);
      toast.success(res?.message || "Card removed successfully");
      await fetchSavedCards();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to remove card",
      );
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-2 space-y-6 min-h-screen">
      <SectionTitle title="Credit Cards" />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : savedCards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {savedCards.map((pm) => (
            <div key={pm.id}>
              <CardFace
                pm={pm}
                isRemoving={actingId === pm.id}
                onRemove={handleRemove}
              />
            </div>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <CardIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">No saved cards yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Add a card to speed up checkout next time
              </p>
            </div>
            <Link href="?add-card-modal=add-card">
              <Button className="rounded-full mt-2">
                <Plus className="w-4 h-4" />
                Add Card
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
