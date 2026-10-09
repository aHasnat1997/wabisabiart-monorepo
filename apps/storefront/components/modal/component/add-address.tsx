"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { regionOptions } from "@/lib/country-options";
import SectionTitle from "@/components/SectionTitle";
import { addAddress } from "@/lib/auth-server";
import { toast } from "sonner";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";


const addressSchema = z.object({
  country: z.string().min(1, "Country is required"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  stateProvince: z.string().min(5, "State/Province is required"),
  addressLine1: z.string().optional(),
  city: z.string().min(2, "City is required"),
  postalCode: z.string().optional(),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  label: z.string().optional(),
});

type AddressFormData = z.infer<typeof addressSchema>;

export default function AddAddress() {
  const [loading, setLoading] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      country: "US",
      fullName: "",
      stateProvince: "",
      addressLine1: "",
      city: "",
      postalCode: "",
      phoneNumber: "",
      label: "",
    },
  });

  const onSubmit = async (data: AddressFormData) => {
    console.log("Address saved successfully:", data);
    setLoading(true);
    try {
      const res = await addAddress(data);
      if (res.success) {
        window.history.back();
        reset();
        toast.success(res.message || "Address added successfully");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add address",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    window.history.back();
    reset();
  };

  return (
    <div className="w-full p-1 md:p-2 pb-12">
      <div className="w-full">
        <SectionTitle
          title="Enter an address"
          subtitle="Add your shipping address for a seamless delivery experience."
        />

        <div className="space-y-4 mt-6">
          {/* Country */}
          <div className="space-y-2">
            <Label htmlFor="country" className="text-foreground">
              Country
            </Label>
            <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="h-9! md:h-11! bg-background border-0 w-full rounded-lg text-foreground text-sm md:text-base">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {regionOptions.map((country) => (
                      <SelectItem key={country.value} value={country.value}>
                        <span>
                          {country.flag} {country.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.country && (
              <p className="text-sm text-destructive">
                {errors.country.message}
              </p>
            )}
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-foreground">
              Full Name
            </Label>
            <Controller
              name="fullName"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="fullName"
                  placeholder="Enter your full name"
                  className="h-9! md:h-11! bg-background border-0 rounded-lg text-foreground placeholder:text-muted-foreground text-sm md:text-base"
                />
              )}
            />
            {errors.fullName && (
              <p className="text-sm text-destructive">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Street Address */}
          <div className="space-y-2">
            <Label htmlFor="streetAddress" className="text-foreground">
              Street Address
            </Label>
            <Controller
              name="stateProvince"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="streetAddress"
                  placeholder="Enter your street address"
                  className="h-9! md:h-11! bg-background border-0 rounded-lg text-foreground placeholder:text-muted-foreground text-sm md:text-base"
                />
              )}
            />
            {errors.stateProvince && (
              <p className="text-sm text-destructive">
                {errors.stateProvince.message}
              </p>
            )}
          </div>

          {/* Apartment/Suite (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="apartment" className="text-foreground">
              Apt/Suite/Other{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Controller
              name="addressLine1"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="apartment"
                  placeholder="Enter your apartment/suite/other"
                  className="h-9! md:h-11! bg-background border-0 rounded-lg text-foreground placeholder:text-muted-foreground text-sm md:text-base"
                />
              )}
            />
          </div>

          {/* City and Postal Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city" className="text-foreground">
                City
              </Label>
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="city"
                    placeholder="Enter your city"
                    className="h-9! md:h-11! bg-background border-0 rounded-lg text-foreground placeholder:text-muted-foreground text-sm md:text-base"
                  />
                )}
              />
              {errors.city && (
                <p className="text-sm text-destructive">
                  {errors.city.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode" className="text-foreground">
                Postal Code{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Controller
                name="postalCode"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="postalCode"
                    placeholder="Enter your postal code"
                    className="h-9! md:h-11! bg-background border-0 rounded-lg text-foreground placeholder:text-muted-foreground text-sm md:text-base"
                  />
                )}
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-foreground">
              Phone
            </Label>
            <Controller
              name="phoneNumber"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="phoneNumber"
                  type="tel"
                  placeholder="Enter your phone number"
                  className="h-9! md:h-11! bg-background border-0 rounded-lg text-foreground placeholder:text-muted-foreground text-sm md:text-base"
                />
              )}
            />
            {errors.phoneNumber && (
              <p className="text-sm text-destructive">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="label" className="text-foreground">
              Remarks (optional)
            </Label>
            <Controller
              name="label"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="label"
                  placeholder="Enter remarks for this address (optional)"
                  className="h-9! md:h-11! bg-background border-0 rounded-lg text-foreground placeholder:text-muted-foreground text-sm md:text-base"
                />
              )}
            />
            {errors.label && (
              <p className="text-sm text-destructive">{errors.label.message}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="destructive"
              onClick={handleCancel}
              className="flex-1 h-9! md:h-11! rounded-full text-sm md:text-base hover:shadow-lg transition-shadow duration-300"
            >
              Cancel
            </Button>
            <Button
              disabled={loading}
              type="button"
              onClick={handleSubmit(onSubmit)}
              className="flex-1 h-9! md:h-11! rounded-full text-sm md:text-base hover:shadow-lg transition-shadow duration-300"
            >
              Save Address {loading && <Spinner />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}