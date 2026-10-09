"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";

interface QuantityInputProps {
  min?: number;
  max?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
}

export function QuantityInput({
  min = 1,
  max = 99,
  defaultValue = 1,
  onChange,
}: QuantityInputProps) {
  const [quantity, setQuantity] = useState(defaultValue);

  const handleDecrease = () => {
    if (quantity > min) {
      const newValue = quantity - 1;
      setQuantity(newValue);
      onChange?.(newValue);
    }
  };

  const handleIncrease = () => {
    if (quantity < max) {
      const newValue = quantity + 1;
      setQuantity(newValue);
      onChange?.(newValue);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= min && value <= max) {
      setQuantity(value);
      onChange?.(value);
    } else if (e.target.value === "") {
      setQuantity(min);
      onChange?.(min);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        className="h-8 md:h-10 w-8 md:w-10 rounded-md md:rounded-lg"
        onClick={handleDecrease}
        disabled={quantity <= min}
      >
        <Minus className="size-3 md:size-4" />
      </Button>

      <Input
        type="number"
        value={quantity}
        onChange={handleInputChange}
        className="h-8 md:h-10 w-12 md:w-14 text-sm md:text-base text-center font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        min={min}
        max={max}
      />

      <Button
        variant="outline"
        size="icon"
        className="h-8 md:h-10 w-8 md:w-10 rounded-md md:rounded-lg"
        onClick={handleIncrease}
        disabled={quantity >= max}
      >
        <Plus className="size-3 md:size-4" />
      </Button>
    </div>
  );
}
