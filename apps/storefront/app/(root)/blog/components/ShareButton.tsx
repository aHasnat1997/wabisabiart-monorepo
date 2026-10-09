"use client";

import { useState } from "react";
import {
  Share2,
  Link2,
  Check,
  Twitter,
  Facebook,
  MessageCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Share options config ─────────────────────────────────────────────────────

type ShareOption = {
  label: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  action: (url: string, title: string) => void;
};

const openPopup = (href: string) =>
  window.open(href, "_blank", "noopener,noreferrer,width=620,height=500");

const SHARE_OPTIONS: ShareOption[] = [
  {
    label: "X (Twitter)",
    icon: <Twitter size={14} />,
    color: "text-foreground",
    bg: "hover:bg-foreground/5",
    action: (url, title) =>
      openPopup(
        `https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      ),
  },
  {
    label: "Facebook",
    icon: <Facebook size={14} />,
    color: "text-blue-500",
    bg: "hover:bg-blue-500/5",
    action: (url) =>
      openPopup(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      ),
  },
  {
    label: "WhatsApp",
    icon: <MessageCircle size={14} />,
    color: "text-green-500",
    bg: "hover:bg-green-500/5",
    action: (url, title) =>
      openPopup(`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`),
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function ShareButton({ url, title }: { url?: string; title?: string }) {
  const [copied, setCopied] = useState(false);

  const shareUrl =
    url ?? (typeof window !== "undefined" ? window.location.href : "");
  const shareTitle = title ?? "Check this out";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 hover:bg-background cursor-pointer rounded px-2 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors outline-none">
          <Share2 size={15} />
          Share
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-48 p-1.5 rounded-xl shadow-lg"
      >
        <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-semibold px-2 pb-1">
          Share via
        </DropdownMenuLabel>

        {/* Copy link */}
        <DropdownMenuItem
          onClick={copyLink}
          className={cn(
            "flex items-center gap-2.5 cursor-pointer rounded-lg px-2 py-2 text-sm transition-colors",
            copied
              ? "text-primary bg-primary/5"
              : "text-foreground hover:bg-muted",
          )}
        >
          <span
            className={cn(
              "flex items-center justify-center h-6 w-6  rounded-md border transition-colors",
              copied
                ? "bg-primary/10 border-primary/20 text-primary"
                : "bg-muted border-border text-muted-foreground",
            )}
          >
            {copied ? <Check size={12} /> : <Link2 size={12} />}
          </span>
          <span className="font-medium">
            {copied ? "Copied!" : "Copy link"}
          </span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1.5 mx-1" />

        {/* Social options */}
        {SHARE_OPTIONS.map((opt) => (
          <DropdownMenuItem
            key={opt.label}
            onClick={() => opt.action(shareUrl, shareTitle)}
            className={cn(
              "flex items-center gap-2.5 hover:bg-muted! cursor-pointer rounded-lg px-2 py-2 text-sm transition-colors",
              opt.bg,
            )}
          >
            <span
              className={cn(
                "flex items-center justify-center h-6 w-6 rounded-md border border-border bg-muted",
                opt.color,
              )}
            >
              {opt.icon}
            </span>
            <span className="font-medium text-foreground">{opt.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
