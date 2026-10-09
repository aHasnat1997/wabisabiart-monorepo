"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isUser } from "@/lib/auth-server";
import { toast } from "sonner";
import { tr } from "date-fns/locale";
import { updateLike } from "./action";

type Particle = { id: number; angle: number; distance: number };

export function LikeButton({
  initialLiked,
  initialCount,
  journalId,
}: {
  initialLiked: boolean;
  initialCount: number;
  journalId: string;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [pressing, setPressing] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const auth = await isUser();
      setAuthenticated(auth);
    };
    checkAuth();
  }, []);
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!authenticated) {
      toast.error("You must be logged in to like a journal");
      return;
    }

    const next = !liked;

    try {
      const res = await updateLike(journalId, next ? "like" : "unlike");
      if (res.success) {
        setLiked(next);
        setCount((c) => (next ? c + 1 : c - 1));
      }
    } catch (error) {
      // Revert on error
      setLiked((l) => !l);
      setCount((c) => (next ? c - 1 : c + 1));
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }

    if (next) {
      const burst: Particle[] = Array.from({ length: 6 }, (_, i) => ({
        id: Date.now() + i,
        angle: (360 / 6) * i,
        distance: 18 + Math.random() * 8,
      }));
      setParticles(burst);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setParticles([]), 600);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      onMouseDown={() => setPressing(true)}
      onMouseUp={() => setPressing(false)}
      onMouseLeave={() => setPressing(false)}
      className={cn(
        "relative h-7 w-auto gap-1 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-150 cursor-pointer",
        pressing && "scale-90",
        liked && "text-destructive",
      )}
      aria-label="Like"
    >
      {/* Burst particles */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="pointer-events-none absolute left-1/2 top-1/2 h-1 w-1 rounded-full bg-destructive"
          style={{
            transform: "translate(-50%, -50%)",
            animation: "particle-burst 0.55s ease-out forwards",
            ["--angle" as string]: `${p.angle}deg`,
            ["--dist" as string]: `${p.distance}px`,
          }}
        />
      ))}

      {/* Heart SVG */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="13"
        height="13"
        viewBox="0 0 24 24"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(
          "transition-all duration-200",
          liked
            ? "fill-destructive stroke-destructive scale-110"
            : "fill-none stroke-current scale-100",
        )}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>

      <span>{count}</span>

      <style>{`
        @keyframes particle-burst {
          0%   { opacity: 1; transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0); }
          100% { opacity: 0; transform: translate(-50%, -50%) rotate(var(--angle)) translateY(calc(-1 * var(--dist))); }
        }
      `}</style>
    </Button>
  );
}
