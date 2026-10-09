"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/animate-ui/components/buttons/button";
import Link from "next/link";
import Lottie from "lottie-react";
import successFullLottie from "@/assets/lottie/successfully.json";

export default function OnboardingSuccess() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/seller-dashboard");
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="text-center max-w-xl flex-col flex items-center py-8 justify-center">
      {/* Animated Success Icon */}
      <div className="w-48 h-48">
        <Lottie animationData={successFullLottie} loop={true} autoplay={true} />
      </div>

      <h1 className="text-3xl mb-2 mt-8 font-bold text-foreground">
        Stripe Onboarding Successful
      </h1>

      <p className="mb-6 text-muted-foreground text-base leading-relaxed">
        Your Stripe account has been connected successfully. You can now start
        receiving payments from customers.
      </p>

      <Link href="/seller-dashboard">
        <Button className="h-11 px-6 rounded-lg font-semibold text-base">
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
}