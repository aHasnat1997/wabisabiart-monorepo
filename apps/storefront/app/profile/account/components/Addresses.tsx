import { Pencil, Trash2, MapPin, Phone, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/animate-ui/components/buttons/button";
import Link from "next/link";
import SectionTitle from "@/components/SectionTitle";
import { Address } from "@/types/address";
import {
  deleteAddress,
  getAddress,
  setDefaultAddress,
} from "@/lib/auth-server";
import { toast } from "sonner";
import { useCallback, useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
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

export default function Addresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAddresses = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getAddress();
      setAddresses(res || []);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      toast.error("Failed to load addresses");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleEdit = (id: string) => {
    console.log("Editing address:", id);
  };

  const handleRemove = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await deleteAddress(id);
      toast.success(res.message || "Address removed successfully");
      await fetchAddresses();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to remove address",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await setDefaultAddress(id);
      toast.success(res.message || "Default address set successfully");
      await fetchAddresses();
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
    <div className="max-w-4xl mx-auto p-2 space-y-6 min-h-screen">
      <SectionTitle
        title="Your Addresses"
        button={
          <Link href="?add-address-modal=add-address">
            <Button className="rounded-full h-8 text-sm md:h-9 px-4! hover:shadow-lg transition-all duration-300">
              <Plus />
              Add <span className="hidden md:inline">New Address</span>
            </Button>
          </Link>
        }
      />

      {/* Address Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses.map((address) => (
          <Card
            key={address.id}
            className={`group hover:shadow-lg transition-all duration-300 ${
              address.isDefaultShipping
                ? "border-primary shadow-md ring-2 ring-primary/10"
                : "hover:border-primary/50"
            }`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">{address.fullName}</CardTitle>
                  <CardDescription className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {address.country}
                  </CardDescription>
                </div>
                {address.isDefaultShipping && (
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-primary/20">
                    Default
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Address Details */}
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div className="space-y-0.5">
                    <p className="text-foreground">
                      {address.stateProvince}
                      {address.addressLine1 && `, ${address.addressLine1}`}
                    </p>
                    <p className="text-muted-foreground">
                      {address.city} - {address.postalCode}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <p className="text-foreground font-medium">
                    {address.phoneNumber}
                  </p>
                </div>
                <p>Remarks: {address.label}</p>
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(address.id)}
                    className="h-8 px-3 hover:bg-primary/10 hover:text-primary"
                  >
                    <Pencil className="w-3.5 h-3.5 mr-1.5" />
                    Edit
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                        Remove
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
                            Are you sure remove this item?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-sm text-muted-foreground">
                            This action cannot be undone. The item will be
                            removed from your cart and you will need to add it
                            again if you change your mind.
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter className="mt-6 flex justify-end gap-3">
                          <AlertDialogClose className="px-4 py-2 cursor-pointer text-sm font-medium rounded-md border-secondary border hover:bg-muted/80 transition-colors">
                            Cancel
                          </AlertDialogClose>
                          <AlertDialogClose
                            onClick={() => handleRemove(address.id)}
                            className="px-4 py-2 text-sm cursor-pointer font-medium rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                          >
                            Remove {isLoading && <Spinner />}
                          </AlertDialogClose>
                        </AlertDialogFooter>
                      </AlertDialogPopup>
                    </AlertDialogPortal>
                  </AlertDialog>
                </div>

                {!address.isDefaultShipping && (
                  <Button
                    disabled={isLoading}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetDefault(address.id)}
                    className="h-8 text-xs w-full md:w-auto transition-colors"
                  >
                    Set as Default {isLoading && <Spinner />}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {addresses.length === 0 && (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <MapPin className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">No addresses yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Add your first shipping address to get started with faster
                checkout
              </p>
            </div>
            <Link href="?add-address-modal=add-address">
              <Button className="rounded-full mt-2">
                <Plus className="w-4 h-4" />
                Add Address
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
