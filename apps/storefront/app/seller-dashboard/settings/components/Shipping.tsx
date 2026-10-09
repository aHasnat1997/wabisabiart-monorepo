import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box } from "lucide-react";
import { useForm } from "react-hook-form";
import z from "zod";

const shippingSchema = z.object({
  address: z.string().min(5, "Address is required"),
  processingTime: z.number().min(1, "Processing time required"),
});

type ShippingFormValues = z.infer<typeof shippingSchema>;

const Shipping = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      address:
        "Handmade crafts and unique items\n123 Market Street\nAccra, Ghana\n00233",
      processingTime: 3,
    },
  });

  const onSubmit = (data: ShippingFormValues) => {
    console.log("Form data:", data);

    // ekhane RTK Query mutation call kora jabe backend e pathanor jonno
  };
  return (
    <div>
      <Card className="w-full shadow-md ">
        <CardHeader>
          <CardTitle className="text-lg flex  font-normal items-center gap-3">
            <Box className="text-chart-7" />
            <p>Shipping</p>
          </CardTitle>
        </CardHeader>
        {/* Content can be added here in the future */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-5">
            {/* Store Description */}
            <div className="space-y-2">
              <Label htmlFor="store-description">
                Default Shipping Address
              </Label>
              <Textarea
                {...register("address")}
                className="bg-muted min-h-30"
              />
              {errors.address && (
                <p className="text-sm text-destructive">
                  {errors.address.message}
                </p>
              )}
            </div>
            {/* Store Name */}
            <div className="space-y-2">
              <Label htmlFor="store-name">Processing Time (Days)</Label>
              <Input
                {...register("processingTime", { valueAsNumber: true })}
                className="bg-muted"
              />
              {errors.processingTime && <p>{errors.processingTime.message}</p>}
            </div>
            {/* Button */}
            <Button
              type="submit"
              className="w-full bg-chart-7/90 hover:bg-chart-7/70 text-card "
            >
              Save Shipping Settings
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
};

export default Shipping;
