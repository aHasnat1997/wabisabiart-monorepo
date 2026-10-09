import { LucideIcon } from "lucide-react";

export type ImportSource = "shopify" | "etsy" | "custom";

export type ImportStatus = "completed" | "pending";

export interface SourceConfig {
  id: ImportSource;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface ImportHistoryItem {
  id: string;
  source: ImportSource;
  importedAt: string; // ISO date
  reviewCount: number;
  status: ImportStatus;
}
