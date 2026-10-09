"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { useSearchParams } from "next/navigation";
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
import { useState } from "react";
import { toast } from "sonner";
import { reportProduct } from "@/components/actions";
import { Spinner } from "@/components/ui/spinner";

const reportSchema = z.object({
  reportReason: z.string().min(1, "Please select a reason"),
  additionalDetails: z.string().optional(),
});

type ReportFormData = z.infer<typeof reportSchema>;

const reportReasons = [
  { value: "counterfeit", label: "Counterfeit or fake product" },
  { value: "misleading", label: "Misleading description" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "safety", label: "Safety concerns" },
  { value: "copyright", label: "Copyright violation" },
  { value: "other", label: "Other" },
];

export default function ReportProduct() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      reportReason: "",
      additionalDetails: "",
    },
  });

  const onSubmit = async (data: ReportFormData) => {
    if (!productId) {
      toast.error("Product ID is missing.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await reportProduct({
        productId,
        reason: data.reportReason,
        description: data.additionalDetails ?? "",
      });

      toast.success(res.message || "Report submitted successfully.");
      reset();
      window.history.back();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to submit report.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    reset();
    window.history.back();
  };

  return (
    <div className="w-full p-1 md:p-2 pb-12">
      <div className="w-full">
        <h2 className="text-[32px] font-semibold leading-tight text-foreground">
          What&lsquo;s wrong with this listing?
        </h2>
        <p className="text-muted-foreground font-normal text-base mt-2">
          Help us maintain quality by reporting issues with this product.
        </p>

        <div className="space-y-4 mt-6">
          {/* Report Reason */}
          <div className="space-y-2">
            <Label htmlFor="reportReason" className="text-foreground">
              Reason for report
            </Label>
            <Controller
              name="reportReason"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="h-11! bg-background border-0 w-full rounded-lg text-foreground">
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportReasons.map((reason) => (
                      <SelectItem key={reason.value} value={reason.value}>
                        {reason.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.reportReason && (
              <p className="text-sm text-destructive">
                {errors.reportReason.message}
              </p>
            )}
          </div>

          {/* Additional Details */}
          <div className="space-y-2">
            <Label htmlFor="additionalDetails" className="text-foreground">
              Additional details{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Controller
              name="additionalDetails"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="additionalDetails"
                  placeholder="Provide more information about the issue"
                  className="h-11! bg-background border-0 rounded-lg text-foreground placeholder:text-muted-foreground"
                />
              )}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="destructive"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="flex-1 h-11 rounded-full text-lg hover:shadow-lg transition-shadow duration-300"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit(onSubmit)}
              className="flex-1 h-11 rounded-full text-lg hover:shadow-lg transition-shadow duration-300"
            >
              Submit Report {isSubmitting && <Spinner />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}