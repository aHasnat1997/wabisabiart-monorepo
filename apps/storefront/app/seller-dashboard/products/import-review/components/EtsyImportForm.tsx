"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { etsySchema } from "./formvalidationSchema";
import { CircleAlert } from "lucide-react";

type EtsyFormValues = z.infer<typeof etsySchema>;

export function EtsyImportForm() {
  const form = useForm<EtsyFormValues>({
    resolver: zodResolver(etsySchema),
    defaultValues: {
      shopName: "",
      apiKey: "",
    },
  });

  const onSubmit = (data: EtsyFormValues) => {
    console.log("Etsy Import:", data);
  };

  return (
<div>
        <h2 className="mb-6">Connect Etsy Shop</h2>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="shopName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shop Name</FormLabel>
              <FormControl>
                <Input placeholder="your-etsy-shop" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="apiKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>API Key</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex p-4 bg-chart-3/10 rounded-xl border items-center gap-4">
            <CircleAlert className="text-chart-3"/>
            <p className="text-muted-foreground text-sm">
                Only genuine reviews from verified purchases will be imported. Reviews will be subject to our quality verification process.
            </p>
        </div>

        <Button className="w-full">Import Reviews</Button>
      </form>
    </Form>
</div>
  );
}
