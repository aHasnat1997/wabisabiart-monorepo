
"use client"

import { useState } from "react";
import { PanelTop } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/animate-ui/components/radix/dialog";


// ================= TYPES =================

// Payment Type (future API compatible)
export interface Payment {
  _id: string;
  type: string;
  account: string;
  createdAt?: string;
}

// Zod Schema
const paymentSchema = z.object({
  type: z.string().min(2, "Payment type required"),
  account: z.string().min(3, "Account info required"),
});

// Infer type from Zod
type PaymentFormData = z.infer<typeof paymentSchema>;


// ================= HELPER =================

const maskAccount = (value: string): string => {
  if (!value) return "";
  const last4 = value.slice(-4);
  return `**** **** **** ${last4}`;
};


// ================= COMPONENT =================

const PaymentMethod = () => {
  const [open, setOpen] = useState<boolean>(false);

  const [payments, setPayments] = useState<Payment[]>([
    {
      _id: "1",
      type: "Bank Account",
      account: "4532453245324532",
    },
    {
      _id: "2",
      type: "PayPal",
      account: "amina.badu@email.com",
    },
  ]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
  });

 const onSubmit = (data: PaymentFormData) => {
  const newPayment: Payment = {
    _id: crypto.randomUUID(),
    ...data,
  };
  console.log("New Payment Method:", newPayment);

  setPayments((prev) => [...prev, newPayment]);
  reset();
  setOpen(false);
};

  return (
    <Card className="w-full h-full shadow-md">
      <CardHeader>
        <CardTitle className="text-lg flex font-normal items-center gap-3">
          <PanelTop className="text-chart-2" />
          <p>Payment Methods</p>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">

        {/* --------- Payment List --------- */}
        {payments.map((item: Payment) => (
          <div
            key={item._id}
            className="flex justify-between bg-accent-foreground items-center p-4 rounded-md"
          >
            <div>
              <h1>{item.type}</h1>
              <p className="text-sm text-muted-foreground/75">
                {item.type === "Bank Account"
                  ? maskAccount(item.account)
                  : item.account}
              </p>
            </div>

            <Badge className="p-2 rounded-lg text-chart-2 bg-primary/10">
              Connected
            </Badge>
          </div>
        ))}

        {/* --------- Add Button + Dialog --------- */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full p-1 rounded-sm bg-primary hover:bg-primary/80 text-card">
              Add Payment Method
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Payment Method</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              <div>
                <Label className="mb-2">Payment Type</Label>
                <Input
                  {...register("type")}
                  placeholder="Bank Account / PayPal"
                />
                <p className="text-sm text-destructive">
                  {errors.type?.message}
                </p>
              </div>

              <div>
                <Label className="mb-2">Account Info</Label>
                <Input
                  {...register("account")}
                  placeholder="Account number or email"
                />
                <p className="text-sm text-destructive">
                  {errors.account?.message}
                </p>
              </div>

              <Button type="submit" className="w-full">
                Save
              </Button>
            </form>
          </DialogContent>
        </Dialog>

      </CardContent>
    </Card>
  );
};

export default PaymentMethod;

