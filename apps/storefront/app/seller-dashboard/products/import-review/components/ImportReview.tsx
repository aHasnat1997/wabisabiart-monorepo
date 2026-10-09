"use client"
import { ImportHistoryItem, ImportSource, SourceConfig } from "@/types/sellerDashboard/ImportReview";
import { ShoppingBag, ExternalLink, Upload } from "lucide-react";
import { useState } from "react";
import { SourceCard } from "./SourceCard";
import { ImportHistoryList } from "./ImportHistoryList";
import { ShopifyImportForm } from "./ShopifyImportForm";
import { EtsyImportForm } from "./EtsyImportForm";
import { CustomImportForm } from "./CustomImportForm";
import ImportModeSelector from "./ImportModeSelector";


export const SOURCE_CONFIGS: SourceConfig[] = [
  {
    id: "shopify",
    title: "Shopify",
    description: "Import reviews from your Shopify store",
    icon: ShoppingBag,
  },
  {
    id: "etsy",
    title: "Etsy",
    description: "Import reviews from your Etsy shop",
    icon: ExternalLink,
  },
  {
    id: "custom",
    title: "Custom Store",
    description: "Upload reviews via CSV or XLSX",
    icon: Upload,
  },
];

export const IMPORT_HISTORY: ImportHistoryItem[] = [
  {
    id: "1",
    source: "shopify",
    importedAt: "2024-04-14",
    reviewCount: 142,
    status: "completed",
  },
  {
    id: "2",
    source: "etsy",
    importedAt: "2024-04-12",
    reviewCount: 89,
    status: "completed",
  },
  {
    id: "3",
    source: "custom",
    importedAt: "2024-04-10",
    reviewCount: 1200,
    status: "completed",
  },
];

export default function ImportReviewsPage() {
  const [activeSource, setActiveSource] = useState<ImportSource>("shopify");

  const renderForm = () => {
    switch (activeSource) {
      case "shopify":
        return <ShopifyImportForm />;
      case "etsy":
        return <EtsyImportForm />;
      case "custom":
        return <CustomImportForm />;
    }
  };

  return (
    <div className=" space-y-8">

         <header>
        <h2 className="text-xl font-medium">Import Reviews</h2>
        <p className="text-sm text-gray-500">
          Import verified customer reviews from external platforms.
        </p>
      </header>

       <section className="bg-card border rounded-xl p-6">
        <ImportModeSelector></ImportModeSelector>
      </section>
     

      <section className="grid sm:grid-cols-3 gap-4">
        {SOURCE_CONFIGS.map(cfg => (
          <SourceCard
            key={cfg.id}
            config={cfg}
            active={cfg.id === activeSource}
            onSelect={setActiveSource}
          />
        ))}
      </section>

       <section className="bg-card border rounded-xl p-6">
        {renderForm()}
      </section>

 
      <section className="bg-card border rounded-xl overflow-hidden">
        <ImportHistoryList items={IMPORT_HISTORY} />
      </section>
    </div>
  );
}