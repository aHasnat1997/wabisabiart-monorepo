"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type ImportMode = "all" | "specific";

export default function ImportModeSelector() {
  const [mode, setMode] = useState<ImportMode>("all");

  return (
    <div className="w-full p-0 space-y-6 ">
      {/* Title */}
      <h3 className="text-foreground font-medium text-sm">Select Import Mode</h3>

      {/* Mode Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {["all", "specific"].map((m) => {
          const isActive = mode === m;
          const title = m === "all" ? "All Products" : "Specific Product";
          const desc =
            m === "all"
              ? "Import all reviews from your store"
              : "Import reviews for one product only";

          return (
            <motion.div
              key={m}
              layout
              initial={{ scale: 1 }}
              animate={{ scale: isActive ? 1.02 : 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <Card
                onClick={() => setMode(m as ImportMode)}
                className={cn(
                  "w-full cursor-pointer transition-all duration-200  border-2",
                  isActive
                    ? "border-primary bg-primary/10 shadow-md"
                    : "border-border hover:border-muted"
                )}
              >
                <CardContent className="p-4 flex flex-col items-start gap-1">
                  <h4 className="font-semibold text-sm text-foreground">{title}</h4>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Conditional Select for Specific Product */}
      <AnimatePresence mode="wait">
        {mode === "specific" && (
          <motion.div
            key="specific-select"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="space-y-2"
          >
            <label className="text-foreground font-medium text-sm block mb-1">
              Select Product
            </label>

            <Select defaultValue="leather-journal">
              <SelectTrigger className="w-full rounded-lg  border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/10">
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="leather-journal">Leather Journal</SelectItem>
                <SelectItem value="wooden-pen">Wooden Pen</SelectItem>
                <SelectItem value="ceramic-mug">Ceramic Mug</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
