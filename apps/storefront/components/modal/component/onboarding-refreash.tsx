"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/animate-ui/components/buttons/button";
import Link from "next/link";
import Lottie from "lottie-react";
import warningLottie from "@/assets/lottie/warning.json";

export default function OnboardingRefresh() {
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
        <Lottie animationData={warningLottie} loop={true} autoplay={true} />
      </div>

      <h1 className="text-3xl mb-2 mt-8 font-bold text-foreground">
        Stripe Onboarding Failed
      </h1>

      <p className="mb-6 text-muted-foreground text-base leading-relaxed">
        We couldn&apos;t complete your Stripe onboarding process. Please try
        again or contact support if the issue persists.
      </p>

      <Link href="/seller-dashboard">
        <Button
          variant={"destructive"}
          className="h-11 px-6 bg-yellow-500 hover:bg-yellow-600 rounded-lg font-semibold text-base"
        >
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
}
