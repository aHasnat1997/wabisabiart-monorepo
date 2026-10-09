import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  InfoCardProps,
  RecentActivityItem,
  RequireAttentionItem,
} from "@/types/sellerDashboard/CardItems";

const InfoCard = <T extends RequireAttentionItem | RecentActivityItem>({
  title,
  items,
  variant,
}: InfoCardProps<T>) => {
  return (
    <Card className="h-full w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-2">
        {items.map((item, index) => {
          /* ---------- REQUIRE ATTENTION ---------- */
          if (variant === "require" && "status" in item && "bgColor" in item) {
            return (
              <div
                key={index}
                className="rounded-md p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm"
                style={{ backgroundColor: item.bgColor }}
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs opacity-80">{item.description}</p>
                </div>

                <div>
                  <button className="text-xs font-medium mt-1 sm:mt-0">
                    {item.status}
                  </button>
                </div>
              </div>
            );
          }

          /* ---------- RECENT ACTIVITY ---------- */
          if (variant === "recent" && "time" in item && "info" in item) {
            return (
              <div
                key={index}
                className="relative flex gap-3 sm:gap-6 items-start justify-between pb-3 text-sm border-b last:border-b-0"
              >
                {/* DOT */}
                <span className="mt-1 h-2 w-2 rounded-full bg-chart-8 shrink-0" />

                {/* CONTENT */}
                <div className="flex-1">
                  <p className="font-medium leading-none">{item.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.info}
                  </p>
                </div>

                {/* TIME */}
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {item.time}
                </span>
              </div>
            );
          }

          return null;
        })}
      </CardContent>
    </Card>
  );
};

export default InfoCard;
