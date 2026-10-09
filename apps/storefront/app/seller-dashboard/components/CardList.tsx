"use client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronDown } from "lucide-react";
import { IStatCardListProps } from "@/types/sellerDashboard/CardItems";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

type SingleStatProps = {
  id?: number;
  ctitle?: string;
  value?: number | string;
  prefix?: string;
  badge?: string;
  icon?: React.ReactNode;
  color?: string;
  textColor?: string;
  status?: string;
  period?: string;
  items?: never;
  dtitle?: never;
  description?: never;
  actionIcon?: never;
  activeStatus?: string;
};

type ListStatProps = IStatCardListProps & {
  activeStatus?: string;
  ctitle?: never;
  value?: never;
  prefix?: never;
  badge?: never;
  icon?: never;
  color?: never;
  textColor?: never;
};

const StatCardList = (props: SingleStatProps | ListStatProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeStatus = searchParams.get("status") ?? "";

  const handleCardClick = (status?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status) {
      params.set("status", status);
    } else {
      params.delete("status");
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };
 
  // Single card mode
  if (!("items" in props)) {
  const { ctitle, value, prefix, badge, icon, color, textColor, status, period } = props;
  
 const isActive = activeStatus === (status ?? "");
  return (
    <Card
      onClick={() => handleCardClick(status)}
      className={`p-4 hover:shadow-md transition cursor-pointer ${
        isActive ? "border-primary" : " "
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          {icon && (
            <div className={`p-2 rounded-lg   text-white ${color ?? "bg-primary/10"} text-card inline-flex`}>
              {icon}
            </div>
          )}
        </div>
        <div>
          {badge && (
            <Badge className={`p-2 rounded-lg ${textColor ?? "text-chart-4"}`}>
              {badge}
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-0 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">{ctitle}</p>
        </div>
        <div className="text-2xl font-semibold">
          {prefix}{value}
        </div>
        {period && <p className="text-xs text-primary">{period}</p>}
      </CardContent>
    </Card>
  );
}

  // List mode — original, unchanged
  const listProps = props as ListStatProps;
  const { dtitle, description, actionIcon } = listProps; 
  const items = listProps.items ?? [];

  return (
    <div className="mb-7">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-lg font-semibold">{dtitle}</h1>
          <p className="text-sm font-sans text-muted-foreground">{description}</p>
        </div>
        {actionIcon && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 gap-2">
            <Button className="bg-card text-muted-foreground">
              {actionIcon} Export
            </Button>
            <Button className="bg-card text-muted-foreground flex items-center gap-1">
              <Calendar className="w-4 h-4" /> Last 30 Days <ChevronDown className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => {
          const isActive = activeStatus === (item.status ?? "");
          return (
            <Card
              key={item.id}
              onClick={() => handleCardClick(item.status)}
              className={`p-4 hover:shadow-md transition cursor-pointer ${
                isActive ? "border-primary" : "border-transparent"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  {item.icon && (
                    <div className={`p-2 rounded-lg text-white ${item.color ?? "bg-primary/10"} text-card inline-flex`}>
                      {item.icon}
                    </div>
                  )}
                </div>
                <div>
                  {item.badge && (
                    <Badge className={`p-2 rounded-lg ${item.textColor ?? "text-chart-4"}`}>
                      {item.badge}
                    </Badge>
                  )}
                </div>
              </div>
              <CardContent className="p-0 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">{item.ctitle}</p>
                </div>
                <div className="text-2xl font-semibold">
                  {item.prefix}{item.value}
                </div>
                {item.period && <p className="text-xs text-primary">{item.period}</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default StatCardList;