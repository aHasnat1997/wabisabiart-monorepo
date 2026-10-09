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
import { shopifySchema } from "./formvalidationSchema";
import { CircleAlert } from "lucide-react";

type ShopifyFormValues = z.infer<typeof shopifySchema>;

export function ShopifyImportForm() {
  const form = useForm<ShopifyFormValues>({
    resolver: zodResolver(shopifySchema),
    defaultValues: {
      storeUrl: "",
      apiKey: "",
    },
  });

  const onSubmit = (data: ShopifyFormValues) => {
    console.log("Shopify Import:", data);
  };

  return (
   <div>
    <h2 className="mb-6">Connect Shopify Store</h2>
     <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="storeUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Store URL</FormLabel>
              <FormControl>
                <Input placeholder="your-store.myshopify.com" {...field} />
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
                <Input type="password" placeholder="Enter Your Api Key" {...field} />
              </FormControl>
              <p className="text-xs text-muted-foreground">
    Find your API key in Shopify Admin → Settings → Apps and sales channels
  </p>
              <FormMessage  />
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
