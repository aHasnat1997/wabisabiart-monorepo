"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";
import { contactSeller } from "../components/action";
import { useState } from "react";

const schema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Enter a valid email"),
  subject: z.string().min(3, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormData = z.infer<typeof schema>;

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm text-foreground">{label}</Label>
      {children}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[11px] text-destructive"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const res = await contactSeller(data);
      toast.success(res.message || "Message sent successfully!");
      reset();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to send message",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background/50 border border-border/25 rounded-2xl shadow-sm p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-lg md:text-2xl font-bold text-foreground">
          Send us a message
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Have a question or need help? Fill out the form and we&apos;ll get
          back to you as soon as possible.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="grid md:grid-cols-2 gap-4">
          <FormField label="First name" error={errors.firstName?.message}>
            <Input
              {...register("firstName")}
              placeholder="Your first name"
              className={cn(
                "rounded-xl border-border/40 focus:border-foreground text-sm bg-card",
                errors.firstName && "border-destructive",
              )}
            />
          </FormField>

          <FormField label="Last name" error={errors.lastName?.message}>
            <Input
              {...register("lastName")}
              placeholder="Your last name"
              className={cn(
                "rounded-xl border-border/40 focus:border-foreground text-sm bg-card",
                errors.lastName && "border-destructive",
              )}
            />
          </FormField>
        </div>

        <FormField label="Email" error={errors.email?.message}>
          <Input
            {...register("email")}
            placeholder="you@example.com"
            className={cn(
              "rounded-xl border-border/40 focus:border-foreground text-sm bg-card",
              errors.email && "border-destructive",
            )}
          />
        </FormField>

        <FormField label="Subject" error={errors.subject?.message}>
          <Input
            {...register("subject")}
            placeholder="How can we help?"
            className={cn(
              "rounded-xl border-border/40 focus:border-foreground text-sm bg-card",
              errors.subject && "border-destructive",
            )}
          />
        </FormField>

        <FormField label="Message" error={errors.message?.message}>
          <Textarea
            {...register("message")}
            placeholder="Tell us how we can help..."
            rows={6}
            className={cn(
              "rounded-xl border-border/40 focus:border-foreground bg-card text-sm resize-none",
              errors.message && "border-destructive",
            )}
          />
        </FormField>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
          <p className="text-xs text-muted-foreground">
            <Link
              href="/privacy"
              className="hover:text-foreground transition-colors"
            >
              We care about your privacy. Read our Privacy Policy
            </Link>
            .
          </p>

          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="shrink-0"
          >
            <Button
              disabled={isSubmitting}
              type="submit"
              className="rounded-full bg-foreground text-background px-6 py-5 font-semibold text-sm hover:bg-foreground/90 transition-all shadow-lg gap-2"
            >
              {isSubmitting ? <Spinner /> : <Send className="w-4 h-4" />}
              Send Message
            </Button>
          </motion.div>
        </div>
      </form>
    </div>
  );
}
