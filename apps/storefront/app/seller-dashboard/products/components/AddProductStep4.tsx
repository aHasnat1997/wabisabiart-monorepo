"use client";

import { Controller, useFormContext } from "react-hook-form";
import { ProductFormValues } from "./ProductSchema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AddProductStep4Props {
  step: number;
}

const AddProductStep4 = ({ step }: AddProductStep4Props) => {
  const {
    control,
    register,
    // watch,
    formState: { errors },
  } = useFormContext<ProductFormValues>();

  if (step !== 3) return null;

  // const trackInventory = watch("trackInventory");
  // const scheduleCall = watch("scheduleCall");

  return (
    <ScrollArea>
      <div className="space-y-8">
        {/* ===== Special Offer Section ===== */}
        <div>
          <div>
            <h3 className="font-medium text-lg">Add Special Offer</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Attract more buyers with a limited-time discount
            </p>
          </div>

          <div className="bg-primary/10 p-4 rounded-lg space-y-4">
            <p className="text-sm font-medium">Discount Configuration</p>

            <div className="grid grid-cols-2 gap-4">
              {/* Discount Type */}
              <div>
                <Label>Discount Type</Label>
                <Controller
                  name="discountType"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full mt-2">
                        <SelectValue placeholder="Select discount type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Discount</SelectItem>
                        <SelectItem value="percentage">
                          Percentage (%)
                        </SelectItem>
                        <SelectItem value="fixed_amount">
                          Fixed Amount ($)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.discountType && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.discountType.message}
                  </p>
                )}
              </div>

              {/* Discount Value */}
              <div>
                <Label>Discount Value</Label>
                <Input
                  type="number"
                  placeholder="e.g. 10"
                  className="mt-2"
                  {...register("discountValue", { valueAsNumber: true })}
                />
                {errors.discountValue && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.discountValue.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <hr />

        {/* ===== Admin Approval Call ===== */}
        {/* <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Schedule Admin Approval Call</p>
            <p className="text-xs text-muted-foreground">
              Get your product reviewed and approved faster with a quick call
            </p>
          </div>
          <Controller
            name="scheduleCall"
            control={control}
            render={({ field }) => (
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
        </div> 

         <div className="grid grid-cols-2 gap-3">
          {scheduleCall && (
            <>
              <div>
                <Label>Preferred Date</Label>
                <Controller
                  name="callDate"
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal mt-1",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value
                            ? format(new Date(field.value), "PPP")
                            : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            field.value ? new Date(field.value) : undefined
                          }
                          onSelect={(date) =>
                            field.onChange(
                              date ? format(date, "yyyy-MM-dd") : "",
                            )
                          }
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </div>

              <div>
                <Label>Preferred Time</Label>
                <Controller
                  name="callTime"
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal mt-1",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          {field.value ? field.value : "Pick a time"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-3" align="start">
                        <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto">
                          {Array.from({ length: 24 }, (_, h) =>
                            ["00", "30"].map((m) => {
                              const time = `${String(h).padStart(2, "0")}:${m}`;
                              return (
                                <Button
                                  key={time}
                                  type="button"
                                  variant={
                                    field.value === time ? "default" : "ghost"
                                  }
                                  size="sm"
                                  className="text-xs"
                                  onClick={() => field.onChange(time)}
                                >
                                  {time}
                                </Button>
                              );
                            }),
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </div>
            </>
          )}
        </div> */}
      </div>
    </ScrollArea>
  );
};

export default AddProductStep4;

{
  /* <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Schedule Admin Approval Call</p>
            <p className="text-xs text-muted-foreground">
              Get your product reviewed and approved faster with a quick call
            </p>
          </div>
          <Controller
            name="scheduleCall"
            control={control}
            render={({ field }) => (
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
        </div>

        {scheduleCall && (
          <div className="bg-muted/40 rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Preferred Date</Label>
                <Input type="date" {...register("callDate")} />
              </div>
              <div>
                <Label>Preferred Time</Label>
                <Input type="time" {...register("callTime")} />
              </div>
            </div>
            <div>
              <Label>What would you like to discuss?</Label>
              <Textarea
                placeholder="Brief description of your product..."
                {...register("callNote")}
              />
            </div>
            <div className="text-xs bg-blue-50 text-blue-700 p-3 rounded-md">
              Admin will contact you at your registered email to confirm the call.
              Typical approval calls last 10–15 minutes.
            </div>
          </div>
        )}
      </div> */
}
