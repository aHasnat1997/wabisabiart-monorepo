"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

// Accepts both plain hex strings and { label, code } objects
type ColorInput = string | { label: string; code: string };

interface ColorPickerProps {
  colors: ColorInput[];
  defaultSelected?: string;
  onChange?: (color: string) => void;
}

function normalize(c: ColorInput): { label: string; code: string } {
  return typeof c === "string" ? { label: c, code: c } : c;
}

export default function ColorPicker({
  colors,
  defaultSelected,
  onChange,
}: ColorPickerProps) {
  const normalized = colors.map(normalize);
  const firstCode = normalized[0]?.code ?? "";

  const [selected, setSelected] = useState<string>(
    defaultSelected ?? firstCode,
  );
  const [hovered, setHovered] = useState<string | null>(null);

  const handleSelect = (code: string) => {
    setSelected(code);
    onChange?.(code);
  };

  return (
    <div className="flex flex-wrap gap-2.5 p-1">
      {normalized.map(({ label, code }) => {
        const isSelected = selected === code;
        const isHovered = hovered === code;

        return (
          <button
            key={code}
            onClick={() => handleSelect(code)}
            onMouseEnter={() => setHovered(code)}
            onMouseLeave={() => setHovered(null)}
            title={label}
            aria-label={label}
            aria-pressed={isSelected}
            style={
              {
                backgroundColor: code,
                transform: isSelected
                  ? "scale(1.18)"
                  : isHovered
                    ? "scale(1.08)"
                    : "scale(1)",
                boxShadow: isSelected
                  ? `0 0 0 2px white, 0 0 0 3.5px ${code}, 0 4px 10px ${code}88`
                  : isHovered
                    ? `0 2px 8px ${code}66`
                    : "none",
              } as React.CSSProperties
            }
            className={cn(
              "relative w-5 h-5 rounded-full cursor-pointer",
              "transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
              "outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-current",
            )}
          >
            {/* Inner shine overlay */}
            <span
              className={cn(
                "absolute inset-0 rounded-full pointer-events-none",
                "bg-linear-to-br from-white/30 to-transparent",
                "transition-opacity duration-200",
                isSelected || isHovered ? "opacity-100" : "opacity-60",
              )}
            />

            {/* Selected dot */}
            <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span
                style={{
                  backgroundColor: isLight(code)
                    ? "rgba(0,0,0,0.55)"
                    : "rgba(255,255,255,0.9)",
                  transform: isSelected ? "scale(1)" : "scale(0)",
                  opacity: isSelected ? 1 : 0,
                  transition:
                    "transform 0.22s cubic-bezier(0.34,1.56,0.64,1), opacity 0.15s ease",
                }}
                className="w-1.5 h-1.5 rounded-full"
              />
            </span>
          </button>
        );
      })}
    </div>
  );
}

function isLight(hex: string): boolean {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}