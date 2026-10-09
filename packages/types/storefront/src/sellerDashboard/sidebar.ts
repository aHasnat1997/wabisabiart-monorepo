
/* ---------------- TYPES ---------------- */

import type { ElementType } from "react";

export type NavItem = {
  title: string;
  url: string;
  icon: ElementType;
  items?: { title: string; url: string }[];
  arrow?: boolean
};
