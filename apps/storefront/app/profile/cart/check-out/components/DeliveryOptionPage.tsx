"use client";

import { Button } from "@/components/ui/button";
import {
  DrawerHeader,
  DrawerClose,
  DrawerTitle,
  DrawerDescription,
  DrawerContent,
} from "@/components/ui/drawer";
import { useState } from "react";
import ShippingIcon from "@/assets/icons/shipping.svg";
import { ArrowLeft } from "lucide-react";
import { Checkbox } from "@/components/animate-ui/components/base/checkbox";

export default function DeliveryOptionPage({
  setBtnClose,
  setDeliveryOptions,
}: {
  setBtnClose: (value: boolean) => void;
  setDeliveryOptions: (name: string) => void; // ✅ Fixed type
}) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const handleSelect = (id: number) => {
    setSelectedOption(id);
  };

  const handleSave = () => {
    if (selectedOption === null) return;
    const selected = delivery.find((opt) => opt.id === selectedOption);
    if (selected) {
      setDeliveryOptions(selected.name);
      setBtnClose(false);
    }
  };

  return (
    <div className="p-3">
      <DrawerHeader>
        <div className="flex items-center gap-1 md:gap-3">
          <DrawerClose asChild>
            <button className="cursor-pointer">
              <ArrowLeft className="size-5 md:size-6" />
            </button>
          </DrawerClose>
          <DrawerTitle className="text-xl md:text-2xl font-medium">
            Delivery Option
          </DrawerTitle>
        </div>
        <p className="text-muted-foreground text-sm md:text-base ml-3">
          Pick how you would like us to ship your items.
        </p>
      </DrawerHeader>
      <div className="my-10 space-y-5">
        {delivery.map((option) => (
          <div
            key={option.id}
            className="flex cursor-pointer items-center gap-3 rounded-xl border p-3 md:gap-5 md:p-5"
            onClick={() => handleSelect(option.id)}
          >
            <Checkbox
              className={"mt-1.5"}
              checked={selectedOption === option.id}
              onCheckedChange={() => handleSelect(option.id)}
            />

            <div className="flex items-center gap-5">
              <ShippingIcon className="hidden md:block" />
              <div>
                <h3 className="text-base font-semibold text-foreground md:text-lg">
                  {option.name}
                </h3>
                <p className="text-sm text-muted-foreground md:text-base">
                  {option.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <DrawerClose className="rounded-lg h-10 border font-medium">
          Cancel
        </DrawerClose>
        <Button
          className="h-10"
          onClick={handleSave}
          disabled={selectedOption === null}
        >
          Save
        </Button>
      </div>
    </div>
  );
}

const delivery = [
  {
    id: 1,
    name: "Standard Delivery",
    description: "Guaranteed by 7 to 10 days",
    price: "50.00",
  },
  {
    id: 2,
    name: "Premium Delivery",
    description: "Guaranteed by 4 to 6 days",
    price: "120.00",
  },
];
