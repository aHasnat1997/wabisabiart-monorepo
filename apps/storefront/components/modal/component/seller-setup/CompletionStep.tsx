import React from "react";
import { Button } from "@/components/ui/button";
import SectionTitle from "@/components/SectionTitle";
import Lottie from "lottie-react";
import successFullLottie from "@/assets/lottie/successfully.json";

interface CompletionStepProps {
  step: number;
}

const CompletionStep: React.FC<CompletionStepProps> = ({ step }) => {
  if (step !== 10) return null;

  return (
    <div className="w-full">
      <div className="flex justify-center mb-4">
        <div className="w-48 h-48">
          <Lottie
            animationData={successFullLottie}
            loop={true}
            autoplay={true}
          />
        </div>
      </div>
      <SectionTitle
        title="Welcome to Maker Community!"
        subtitle="Thank you for joining! Your shop is now under review and we will
          notify you via email once it is approved."
      />

      <div className="flex flex-col gap-4">
        <Button
          onClick={() => (window.location.href = "/seller-dashboard")}
          type="button"
          className="bg-primary hover:bg-primary/90  h-9! md:h-11! rounded-full text-sm md:text-base hover:shadow-lg transition-shadow duration-300 w-full"
        >
          Go to Dashboard
        </Button>

        <Button
          type="button"
          className="flex-1 border border-primary text-primary  h-9! md:h-11! rounded-full text-sm md:text-base hover:shadow-lg transition-shadow duration-300 w-full"
          variant="ghost"
          onClick={() => {
            console.log("Learning how to create listings...");
            // This would typically open a tutorial or guide
          }}
        >
          Learn How to Create Listings
        </Button>
      </div>
    </div>
  );
};

export default CompletionStep;
