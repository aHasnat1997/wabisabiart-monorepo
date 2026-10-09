"use client";

import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface CountdownTimerProps {
  targetDate: string; // DD/MM/YYYY format
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      // Parse DD/MM/YYYY format
      const [day, month, year] = targetDate.split("/").map(Number);
      const target = new Date(year, month - 1, day, 23, 59, 59);
      const now = new Date();

      const difference = target.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    // Calculate immediately
    calculateTimeLeft();

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const formatTime = (num: number) => String(num).padStart(2, "0");

  return (
    <p className="flex items-center gap-1 md:gap-2 text-base md:text-xl font-medium text-muted-foreground">
      <Clock className="size-4 md:size-5" />
      {timeLeft.days > 0 && `${timeLeft.days}D `}
      {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:
      {formatTime(timeLeft.seconds)}
    </p>
  );
}
