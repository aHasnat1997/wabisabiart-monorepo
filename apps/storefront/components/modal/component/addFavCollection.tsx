"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Radio,
  RadioIndicator,
  RadioGroup,
} from "@/components/animate-ui/primitives/base/radio";
import { useRouter } from "next/navigation";
import SectionTitle from "@/components/SectionTitle";
import { createCollection } from "@/app/(root)/favourite-list/components/action";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

export default function AddFavCollection() {
  const [visibility, setVisibility] = React.useState("public");
  const [collectionName, setCollectionName] = React.useState("");
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleCreateCollection = async () => {
    setIsLoading(true);
    const collectionData = {
      name: collectionName,
      isPublic: visibility === "public",
    };

    try {
      const res = await createCollection(
        collectionData.name,
        collectionData.isPublic,
      );
      if (res.success) {
        toast.success(res.message || "Collection created successfully");
        router.push("/favourite-list");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full p-1 md:p-2 pb-12">
      <SectionTitle
        title="Add Favourite Collection"
        subtitle="Add a new collection to your favourite list."
      />

      <div className="space-y-6">
        <div className="">
          <Label htmlFor="collection-name">Collection name</Label>
          <Input
            id="collection-name"
            type="text"
            placeholder="Enter collection name"
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
            className="h-9! md:h-11! bg-background border-0 mt-2 rounded-lg text-foreground placeholder:text-muted-foreground text-sm md:text-base"
            maxLength={50}
          />
          <div className="flex justify-end items-center mt-1">
            <p className="text-xs text-muted-foreground">
              {collectionName.length}/50
            </p>
          </div>
        </div>

        {/* Visibility Settings */}
        <div className="space-y-3">
          <Label className="text-base">Set visibility</Label>

          <RadioGroup
            value={visibility}
            onValueChange={(value) =>
              setVisibility(value as "public" | "private")
            }
            className="space-y-3 mb-6"
          >
            <div className="flex flex-col gap-3">
              <label
                htmlFor="public"
                className={`flex items-center gap-x-3 p-4 rounded-xl cursor-pointer transition-colors ${
                  visibility === "public"
                    ? "bg-muted"
                    : "bg-background hover:bg-muted/50"
                }`}
              >
                <Radio
                  value="public"
                  id="public"
                  className="w-5 h-5 border-2 rounded-full flex items-center justify-center data-[state=checked]:border-primary"
                >
                  <RadioIndicator className="w-2.5 h-2.5 rounded-full bg-primary opacity-0 transition-opacity data-[state=checked]:opacity-100" />
                </Radio>
                <div className="flex-1">
                  <div className="text-base font-semibold text-foreground">
                    Public
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Anyone can view this collection
                  </p>
                </div>
              </label>

              <label
                htmlFor="private"
                className={`flex items-center gap-x-3 p-4 rounded-xl cursor-pointer transition-colors ${
                  visibility === "private"
                    ? "bg-muted"
                    : "bg-background hover:bg-muted/50"
                }`}
              >
                <Radio
                  value="private"
                  id="private"
                  className="w-5 h-5 border-2 rounded-full flex items-center justify-center data-[state=checked]:border-primary"
                >
                  <RadioIndicator className="w-2.5 h-2.5 rounded-full bg-primary opacity-0 transition-opacity data-[state=checked]:opacity-100" />
                </Radio>
                <div className="flex-1">
                  <div className="text-base font-semibold text-foreground">
                    Private
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Only you can view this collection
                  </p>
                </div>
              </label>
            </div>
          </RadioGroup>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-4">
          <Button
            variant="destructive"
            onClick={() => window.history.back()}
            className="flex-1 h-9! md:h-11! rounded-full text-sm md:text-base hover:shadow-lg transition-shadow duration-300 w-full"
          >
            Cancel
          </Button>

          <Button
            onClick={handleCreateCollection}
            disabled={!collectionName.trim() || isLoading}
            className="flex-1 h-9! md:h-11! rounded-full text-sm md:text-base hover:shadow-lg transition-shadow duration-300 w-full"
          >
            Create collection {isLoading && <Spinner />}
          </Button>
        </div>
      </div>
    </div>
  );
}
