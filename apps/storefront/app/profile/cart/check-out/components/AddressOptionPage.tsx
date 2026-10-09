"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DrawerHeader, DrawerClose, DrawerTitle } from "@/components/ui/drawer";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, MapPin, Phone } from "lucide-react";
import { Checkbox } from "@/components/animate-ui/components/base/checkbox";
import { getAddress, setDefaultAddress } from "@/lib/auth-server";
import { Address } from "@/types/address";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

interface AddressOptionPageProps {
  defaultId?: string;
  setAddressBtnOpen: (open: boolean) => void;
}

export default function AddressOptionPage({
  defaultId,
  setAddressBtnOpen,
}: AddressOptionPageProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(
    defaultId || null,
  );

  const fetchAddresses = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getAddress();
      setAddresses(res || []);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleSetDefault = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await setDefaultAddress(id);
      toast.success(res.message || "Default address set successfully");
      setAddressBtnOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to set default address",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-1 md:p-3">
      <DrawerHeader>
        <div className="flex items-center gap-1 md:gap-3">
          <DrawerClose asChild>
            <button className="cursor-pointer">
              <ArrowLeft className="size-5 md:size-6" />
            </button>
          </DrawerClose>
          <DrawerTitle className="text-xl md:text-2xl font-medium">
            Shipping Address
          </DrawerTitle>
        </div>
        <p className="text-muted-foreground text-sm md:text-base ml-3">
          Select your preferred shipping address
        </p>
      </DrawerHeader>
      <div className="my-10 space-y-4 px-3 md:px-5">
        {addresses.map((address) => (
          <div
            key={address.id}
            className={`cursor-pointer rounded-xl border-2 p-3 md:p-5 transition-all duration-200 ${
              selectedId === address.id
                ? "border-primary bg-primary/5 shadow-md"
                : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
            }`}
            onClick={() => setSelectedId(address.id)}
          >
            <div className="flex items-start gap-2 md:gap-4">
              <Checkbox
                className={"mt-1.5"}
                checked={selectedId === address.id}
                onCheckedChange={() => setSelectedId(address.id)}
              />

              <div className="flex-1 space-y-3">
                {/* Header with name and default badge */}
                <div className="flex items-center justify-between gap-1 md:gap-3">
                  <h3 className="text-lg line-clamp-1 font-semibold md:text-xl">
                    {address.fullName}
                  </h3>
                  {address.isDefaultShipping && (
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-primary/20 shrink-0">
                      Default
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{address.phoneNumber}</span>
                </div>
                {/* Address details */}
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div className="space-y-0.5">
                    <p className="text-foreground">
                      {address.stateProvince}
                      {address.addressLine1 && ` , ${address.addressLine1}`}
                    </p>
                    <p className="text-muted-foreground">
                      {address.city} - {address.postalCode} , {address.country}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 px-5 md:grid-cols-2 md:gap-5">
        <DrawerClose className="h-10 rounded-lg border border-neutral-200 font-medium hover:bg-gray-50 transition-colors">
          Cancel
        </DrawerClose>
        <Button
          className="h-10"
          onClick={() => selectedId && handleSetDefault(selectedId)}
          disabled={selectedId === null || isLoading}
        >
          Save {isLoading && <Spinner />}
        </Button>
      </div>
      <div className="mx-5 mt-10">
        <Link
          href="?add-address-modal=add-address"
          className="border-primary/50 hover:border-primary border-2 hover:bg-primary/15 duration-300 bg-primary/8 text-primary mt-5 flex h-20 lg:h-24 w-full cursor-pointer items-center justify-center rounded-lg border-dashed text-base lg:text-lg font-semibold"
        >
          <Plus className="mr-2" /> Add New Address
        </Link>
      </div>
    </div>
  );
}
