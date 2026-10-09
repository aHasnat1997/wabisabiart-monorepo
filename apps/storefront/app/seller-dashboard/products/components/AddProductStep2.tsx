"use client";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Lock } from "lucide-react";
import { ProductFormValues } from "./ProductSchema";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

const QUICK_ADD = [
  { name: "Color", type: "Color Picker" },
  { name: "Size", type: "Dropdown" },
  { name: "Material", type: "Dropdown" },
  { name: "Style", type: "Dropdown" },
];

interface Props {
  step: number;
}

const AddProductStep2 = ({ step }: Props) => {
  const { watch, setValue } = useFormContext<ProductFormValues>();

  const [customName, setCustomName] = useState("");
  const [customType, setCustomType] = useState<"Dropdown" | "Color Picker">(
    "Dropdown",
  );

  if (step !== 1) return null;

  const fields = watch("customFields") ?? [];

  const addField = (name: string, type: string) => {
    const already = fields.some(
      (f) => f.title.toLowerCase() === name.toLowerCase(),
    );
    if (already) return;
    setValue("customFields", [
      ...fields,
      {
        title: name,
        type: type as "Dropdown" | "Color Picker",
        options: [],
        colors: [],
        value: "",
      },
    ]);
  };

  const removeField = (index: number) => {
    setValue(
      "customFields",
      fields.filter((_, i) => i !== index),
    );
  };

  const updateField = (
    index: number,
    key: "title" | "type" | "value",
    value: string,
  ) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], [key]: value };
    setValue("customFields", updated as ProductFormValues["customFields"]);
  };

  return (
    <ScrollArea>
      <div className="space-y-6">
        {/* Info Banner */}
        <div className="bg-amber-50 border border-chart-3/20 rounded-lg p-4">
          <p className="font-medium text-chart-7 flex items-center gap-2">
            <span>🗂</span> Define Your Attribute Framework
          </p>
          <p className="text-xs text-chart-7 mt-1">
            First, define the attributes that describe your product (e.g.,
            Color, Size, Material). This creates a{" "}
            <strong>shared structure</strong> that every variant will follow —
            ensuring consistency across your entire product.
          </p>
        </div>

        {/* Quick Add */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Quick add:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_ADD.map((q) => {
              const exists = fields.some(
                (f) => f.title.toLowerCase() === q.name.toLowerCase(),
              );
              return (
                <Button
                  key={q.name}
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={exists}
                  className="text-xs gap-1"
                  onClick={() => addField(q.name, q.type)}
                >
                  <Plus size={12} />
                  {q.name}{" "}
                  <span className="text-muted-foreground">
                    ({q.type === "Color Picker" ? "color" : "text"})
                  </span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Attribute List */}
        <div className="border rounded-lg">
          <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/30">
            <Lock size={14} className="text-muted-foreground" />
            <p className="text-sm font-medium">
              Product Attribute Schema — shared by all variants
            </p>
          </div>

          <div className="divide-y">
            {fields.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">
                No attributes defined yet. Use Quick Add or add custom below.
              </p>
            )}
            {fields.map((field, index) => (
              <div key={index} className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {/* existing row - same as before */}
                  <div className="rounded-full bg-primary text-card w-5 h-5 flex items-center justify-center">
                    <span className="text-xs">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <Input
                      className="h-8 text-sm"
                      value={field.title}
                      onChange={(e) =>
                        updateField(index, "title", e.target.value)
                      }
                    />
                  </div>
                  <div className="w-32">
                    <Select
                      value={field.type}
                      onValueChange={(val) => updateField(index, "type", val)}
                    >
                      <SelectTrigger className="h-8 w-full text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Color Picker">color</SelectItem>
                        <SelectItem value="Dropdown">dropdown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    onClick={() => removeField(index)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>

                {field.type === "Dropdown" && (
                  <div className="mt-2 ml-8 space-y-2">
                    <Input
                      className="h-8 text-sm"
                      placeholder="Option1, Option2, Option3"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        updateField(index, "value", e.target.value)
                      }
                    />

                    {(() => {
                      const tags = (field.value ?? "")
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean);
                      return tags.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag, i) => (
                            <span
                              key={i}
                              className="text-xs px-3 py-1 rounded-full bg-chart-8/10 text-chart-8 border border-blue-200"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Add Custom Attribute */}
        <div className="border rounded-lg p-4 space-y-3">
          <p className="text-sm font-medium">Add custom attribute:</p>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Name</p>
              <Input
                className="h-9"
                placeholder="e.g. weight"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
              />
            </div>
            <div className="w-36">
              <p className="text-xs text-muted-foreground mb-1">Type</p>
              <Select
                value={customType}
                onValueChange={(v) => setCustomType(v as typeof customType)}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Color Picker">Color</SelectItem>
                  <SelectItem value="Dropdown">Dropdown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              className="h-9 w-9 p-0"
              onClick={() => {
                if (!customName.trim()) return;
                addField(customName.trim(), customType);
                setCustomName("");
              }}
            >
              <Plus size={16} />
            </Button>
          </div>
        </div>

        {/* Summary */}
        {fields.length > 0 && (
          <div className="flex items-center justify-between bg-muted/30 border rounded-lg px-4 py-3">
            <div className="flex items-center gap-2">
              <span>🗂</span>
              <div>
                <p className="text-sm font-medium">
                  {fields.length} attributes defined
                </p>
                <p className="text-xs text-muted-foreground">
                  {fields.map((f) => f.title).join(", ")}
                </p>
              </div>
            </div>
            <span className="text-primary">✓</span>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default AddProductStep2;
