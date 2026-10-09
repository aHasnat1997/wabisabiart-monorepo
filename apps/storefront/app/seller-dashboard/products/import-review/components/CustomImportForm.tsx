"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { customSchema } from "./formvalidationSchema";
import { useState } from "react";
import Image from "next/image";
import { CircleAlert, Upload } from "lucide-react";

type CustomFormValues = z.infer<typeof customSchema>;

export function CustomImportForm() {
  const form = useForm<CustomFormValues>({
    resolver: zodResolver(customSchema),
  });

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const onSubmit = (data: CustomFormValues) => {
    console.log("Custom Import:", data.file);
  };

  return (
    <div>
      <h2 className="mb-6">Upload Review File</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="file"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Upload File</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-6 cursor-pointer text-muted-foreground hover:bg-muted/50">
                      {preview ? (
                        <div className="relative h-32 w-full">
                          <Image
                            src={preview}
                            alt="Preview"
                            fill
                            unoptimized
                            className="object-cover rounded-md"
                          />
                        </div>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Click to upload featured image
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PNG or JPEG up to 10MB
                          </p>
                        </>
                      )}
                      <Input
                        type="file"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <div className="flex flex-col p-4 bg-chart-8/10 rounded-xl border items-start gap-2">
            <h4>Require Format:</h4>
            <p className="text-muted-foreground p-1 bg-card text-sm">
              product_name, customer_name, rating, review_text, date
            </p>
        </div>


           <div className="flex p-4 bg-chart-3/10 rounded-xl border items-center gap-4">
            <CircleAlert className="text-chart-3"/>
            <p className="text-muted-foreground text-sm">
                Only genuine reviews from verified purchases will be imported. Reviews will be subject to our quality verification process.
            </p>
        </div>

          <Button className="w-full">Process Upload</Button>
        </form>
      </Form>
    </div>
  );
}
