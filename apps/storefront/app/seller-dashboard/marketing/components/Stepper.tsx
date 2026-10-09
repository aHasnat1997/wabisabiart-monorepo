"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

type Props = {
  steps: string[];
  currentStep: number;
};

export default function Stepper({ steps, currentStep }: Props) {
  return (
    <>
      {/* ── Desktop (sm+) ── */}
      <div className="hidden sm:flex items-center mb-6">
        {steps.map((step, index) => {
          const isCompleted = currentStep > index;
          const isActive = currentStep === index;

          return (
            <div key={index} className="relative flex flex-1 justify-center">
              {/* Left line */}
              {index !== 0 && (
                <div
                  className={cn(
                    "absolute top-4 h-0.5",
                    isCompleted || isActive ? "bg-primary" : "bg-muted-foreground/30"
                  )}
                  style={{ left: 0, right: "calc(50% + 16px)" }}
                />
              )}

              {/* Right line */}
              {index !== steps.length - 1 && (
                <div
                  className={cn(
                    "absolute top-4 h-0.5",
                    isCompleted ? "bg-primary" : "bg-muted-foreground/30"
                  )}
                  style={{ left: "calc(50% + 16px)", right: 0 }}
                />
              )}

              {/* Circle + Label */}
              <div className="relative z-10 text-center">
                <div
                  className={cn(
                    "mx-auto flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all",
                    isCompleted
                      ? "border-primary bg-primary text-white"
                      : isActive
                      ? "border-primary text-primary"
                      : "border-muted-foreground/40 text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check size={14} strokeWidth={3} />
                  ) : (
                    String(index + 1).padStart(2, "0")
                  )}
                </div>
                <p
                  className={cn(
                    "mt-1 text-xs whitespace-nowrap",
                    isCompleted || isActive ? "text-primary font-medium" : "text-muted-foreground"
                  )}
                >
                  {step}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Mobile (< sm) ── */}
      <div className="flex sm:hidden items-center gap-3 mb-5 px-1">
        {/* Progress dots */}
        <div className="flex items-center gap-1.5">
          {steps.map((_, index) => (
            <div
              key={index}
              className={cn(
                "rounded-full transition-all",
                currentStep === index
                  ? "w-5 h-2 bg-primary"
                  : currentStep > index
                  ? "w-2 h-2 bg-primary/60"
                  : "w-2 h-2 bg-muted-foreground/30"
              )}
            />
          ))}
        </div>

        {/* Current step info */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </p>
          <p className="text-sm font-medium text-primary truncate">
            {steps[currentStep]}
          </p>
        </div>

        {/* Next step preview */}
        {currentStep < steps.length - 1 && (
          <div className="text-right shrink-0">
            <p className="text-[10px] text-muted-foreground">Next</p>
            <p className="text-xs text-muted-foreground truncate max-w-[80px]">
              {steps[currentStep + 1]}
            </p>
          </div>
        )}
      </div>
    </>
  );
}