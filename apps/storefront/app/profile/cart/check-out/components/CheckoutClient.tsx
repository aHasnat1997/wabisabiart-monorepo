"use client";

import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { ChevronRight, MapPin, Phone, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { useState } from "react";
import ShippingIcon from "@/assets/icons/shipping.svg";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/animate-ui/components/buttons/button";
import AddressOptionPage from "./AddressOptionPage";
import DeliveryOptionPage from "./DeliveryOptionPage";
import { Address } from "@/types/address";

export default function CheckoutClient({
  defaultAddress,
}: {
  defaultAddress: Address | null;
}) {
  const [addressBtnOpen, setAddressBtnOpen] = useState<boolean>(false);
  const [btnClose, setBtnClose] = useState<boolean>(false);
  const [deliveryOptions, setDeliveryOptions] = useState("Standard Delivery");

  return (
    <section className="grid grid-cols-1 gap-8 w-full md:w-1/2 xl:w-2/3">
      <section>
        <div className="w-full rounded-2xl bg-card p-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xl lg:text-2xl font-medium line-clamp-1">
              Shipping Address
            </h3>
            <Drawer
              open={addressBtnOpen}
              onOpenChange={setAddressBtnOpen}
              direction="right"
            >
              <DrawerTrigger asChild>
                <Button
                  size={"sm"}
                  variant="link"
                  className="text-base text-primary cursor-pointer"
                >
                  Select Address <ChevronRight />
                </Button>
              </DrawerTrigger>
              <DrawerContent className="max-w-125! bg-card">
                <ScrollArea className="h-full">
                  <AddressOptionPage
                    defaultId={defaultAddress?.id}
                    setAddressBtnOpen={setAddressBtnOpen}
                  />
                </ScrollArea>
              </DrawerContent>
            </Drawer>
          </div>

          {defaultAddress && (
            <Card className="border-primary shadow-none ring-2 ring-primary/10">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">
                      {defaultAddress.fullName}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1.5 text-foreground">
                      <Phone className="w-3.5 h-3.5" />
                      {defaultAddress.phoneNumber}
                    </CardDescription>
                  </div>
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-primary/20">
                    Default
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                    <div className="space-y-0.5">
                      <p className="text-foreground">
                        {defaultAddress.stateProvince}
                        {defaultAddress.addressLine1 &&
                          ` , ${defaultAddress.addressLine1}`}
                      </p>
                      <p className="text-muted-foreground">
                        {defaultAddress.city} - {defaultAddress.postalCode} ,{" "}
                        {defaultAddress.country}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-sm">Remarks: {defaultAddress.label}</p>
              </CardContent>
            </Card>
          )}

          <div>
            <Link
              href="?add-address-modal=add-address"
              className="border-primary/50 hover:border-primary border-2 hover:bg-primary/15 duration-300 bg-primary/8 text-primary mt-5 flex h-20 lg:h-24 w-full cursor-pointer items-center justify-center rounded-lg border-dashed text-base lg:text-lg font-semibold"
            >
              <Plus className="mr-2" /> Add New Address
            </Link>
          </div>
        </div>

        <div className="mt-10 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xl lg:text-2xl font-medium line-clamp-1">
              {/* Delivery option */}
              Delivery Fee
            </h3>
            <Drawer
              open={btnClose}
              onOpenChange={setBtnClose}
              direction="right"
            >
              <DrawerTrigger asChild>
                {/* <Button
                  variant="link"
                  size={"sm"}
                  className="text-base text-primary cursor-pointer"
                >
                  View options <ChevronRight />
                </Button> */}
              </DrawerTrigger>
              <DrawerContent className="max-w-125! bg-card">
                <DeliveryOptionPage
                  setDeliveryOptions={setDeliveryOptions}
                  setBtnClose={setBtnClose}
                />
              </DrawerContent>
            </Drawer>
          </div>
          <div className="mt-5 flex w-full items-center justify-between rounded-lg bg-background p-5">
            <div className="flex items-center gap-5">
              <ShippingIcon className="hidden md:block" />
              <div>
                <h3 className="text-base lg:text-lg font-semibold">
                  {deliveryOptions === "Premium Delivery"
                    ? "Premium Delivery"
                    : "Standard Delivery"}
                </h3>
                <p className="text-muted-foreground text-sm lg:text-base">
                  Guaranteed by 18-19 Aug
                </p>
              </div>
            </div>
            <h3 className="text-base lg:text-lg font-semibold">
              {deliveryOptions === "Premium Delivery" ? "$30" : "$20"}
            </h3>
          </div>
        </div>
      </section>
    </section>
  );
}
