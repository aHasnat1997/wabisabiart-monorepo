import React from "react";
import {
  Control,
  FieldErrors,
  UseFormWatch,
  Controller,
  UseFormHandleSubmit,
  SubmitHandler,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Checkbox } from "@/components/animate-ui/components/base/checkbox";
import SectionTitle from "@/components/SectionTitle";
import { Spinner } from "@/components/ui/spinner";
import { ShopFormValues } from "./setup-schema";

interface SellerAgreementStepProps {
  step: number;
  control: Control<ShopFormValues>;
  errors: FieldErrors<ShopFormValues>;
  watch: UseFormWatch<ShopFormValues>;
  handleSubmit: UseFormHandleSubmit<ShopFormValues>;
  onSubmit: SubmitHandler<ShopFormValues>;
  isLoading: boolean;
}

const SellerAgreementStep: React.FC<SellerAgreementStepProps> = ({
  step,
  control,
  errors,
  watch,
  handleSubmit,
  onSubmit,
  isLoading,
}) => {
  if (step !== 5) return null;

  return (
    <div className="w-full">
      <SectionTitle
        title="Before You Continue — Please Read and Accept Our Seller Agreement"
        subtitle="This agreement outlines our zero-tolerance policy on counterfeit goods and ensures compliance with marketplace standards. Your commitment to authenticity builds trust within our community."
      />

      <div className="bg-background rounded-lg md:rounded-xl p-3 md:p-4 mb-6 mt-6">
        <div className="space-y-4 text-sm md:text-base">
          <p className="text-foreground text-justify leading-5">
            Welcome to Maker&apos;s Marketplace, where we foster a community
            built on trust, quality, and originality. This Seller Agreement
            outlines the terms and conditions for selling on our platform,
            ensuring a fair and secure environment for both makers and buyers.
            By agreeing, you commit to upholding the integrity of our
            marketplace and adhering to the policies detailed below.
          </p>
          <p className="text-foreground text-justify leading-5">
            **1. Zero-Tolerance Policy on Counterfeit Goods.** Maker&apos;s
            Marketplace has a strict zero-tolerance policy against the sale of
            counterfeit, replica, or unauthorized goods. Sellers found to be
            listing or selling counterfeit items will face immediate and
            permanent suspension from the platform.
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 mb-6">
        <Controller
          name="agreeToSellerAgreement"
          control={control}
          render={({ field }) => (
            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
          )}
        />
        <Label htmlFor="agreeToSellerAgreement">
          <Link
            className="cursor-pointer text-muted-foreground hover:text-primary"
            href="#"
          >
            I have agreed to the Seller Agreement and Zero-Tolerance Policy.
          </Link>
        </Label>
      </div>
      {errors.agreeToSellerAgreement && (
        <p className="text-sm text-destructive mb-4">
          {errors.agreeToSellerAgreement.message}
        </p>
      )}

      <div className="flex flex-col md:flex-row gap-3">
        <Button
          type="button"
          className="flex-1 h-9! md:h-11! rounded-full text-sm md:text-base hover:shadow-lg transition-shadow duration-300"
          onClick={() => handleSubmit(onSubmit)()}
          disabled={!watch("agreeToSellerAgreement") || isLoading}
        >
          I Agree & Continue {isLoading && <Spinner />}
        </Button>
        <Button
          type="button"
          className="flex-1 h-9! md:h-11! rounded-full text-sm md:text-base border-primary text-primary border hover:shadow-lg transition-shadow duration-300"
          variant="ghost"
        >
          Download Full Policy (PDF)
        </Button>
      </div>
    </div>
  );
};

export default SellerAgreementStep;
