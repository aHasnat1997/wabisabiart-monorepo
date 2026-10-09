"use client";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { Card, CardContent } from "@/components/ui/card";
import { ITopProductsProps } from "@/types/sellerDashboard/CardItems";
import { Calendar, ChevronDown } from "lucide-react";

const ProductCard = ({
  pTitle,
  pDescription,
  items,
  actionIcon,
}: ITopProductsProps) => {
  return (
    <div className="mb-7">
      <div className="flex flex-col mb-3 md:flex-row md:justify-between md:items-start gap-4 md:gap-0">
        {/* Left: Title & Description */}
        <div>
          <h1 className="text-lg font-semibold">{pTitle}</h1>
          <p className="text-sm font-sans text-muted-foreground/80 mt-1 md:mt-2">
            {pDescription}
          </p>
        </div>

        {/* Right: Action Buttons */}
        {actionIcon && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <Button className="bg-card text-muted-foreground whitespace-nowrap">
              {actionIcon} Export
            </Button>
            <Button className="bg-card text-muted-foreground whitespace-nowrap">
              <Calendar className="mr-1 h-4 w-4" /> Last 30 Days{" "}
              <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <Card key={item.id} className="p-4 hover:shadow-md transition">
            <CardContent className="p-0 space-y-3">
              <div className="flex gap-4 items-center">
                <div>
                  {item.icon && (
                    <div
                      className={`p-2 rounded-lg  ${
                        item.color ?? "bg-chart-4/15 "
                      } text-chart-4`}
                    >
                      {item.icon}
                    </div>
                  )}
                </div>
                <div>
                  {/* TOP */}
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-medium text-muted-foreground">
                      {item.cTitle}
                    </p>
                  </div>

                  {/* VALUE */}
                  <div className="text-sm font-semibold">
                    {item.prefix}
                    {item.value}
                  </div>
                </div>
              </div>
              {/* PERIOD */}
              {item.period && (
                <p className={`p-1  ${item.textColor ?? "bg-card"}  `}>
                  {item.period}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProductCard;
