"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import SuccessGif from "@/assets/gif/success.gif";
import { Button } from "@/components/animate-ui/components/buttons/button";
import Link from "next/link";

export default function PaymentSuccess() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/");
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex items-center py-8 justify-center">
      <div className="text-center">
        <Image
          src={SuccessGif}
          alt="Payment Success"
          width={256}
          height={256}
          className="mx-auto md:h-84 w-auto"
          unoptimized
        />
        <h1 className="text-3xl mb-1 mt-4 font-bold text-foreground">
          Payment Successful!
        </h1>
        <p className="mb-4 text-muted-foreground">
          Your payment has been processed successfully.
        </p>
        <Link href="/">
          <Button className="h-11 px-6 rounded-lg font-semibold text-base">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
