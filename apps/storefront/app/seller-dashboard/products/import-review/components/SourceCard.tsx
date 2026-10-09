import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SourceConfig } from "@/types/sellerDashboard/ImportReview";
import { cn } from "@/lib/utils";


interface Props {
  config: SourceConfig;
  active: boolean;
  onSelect: (id: SourceConfig["id"]) => void;
}

export function SourceCard({ config, active, onSelect }: Props) {
  const Icon = config.icon;

  return (
    <Button
      variant="ghost"
      onClick={() => onSelect(config.id)}
      className="h-auto p-0 text-left"
    >
      <Card
        className={cn(
          "w-full transition border",
          active
            ? "border-primary bg-primary/5"
            : "border-border hover:border-muted-foreground"
        )}
      >
        <CardContent className="p-4 flex flex-col items-start gap-4">
          {/* Icon */}
          <div
            className={cn(
              "p-3 rounded-lg",
              active
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            <Icon size={22} />
          </div>

          {/* Text */}
          <div className="space-y-1">
            <h4 className="font-medium text-sm">{config.title}</h4>
            <p className="text-xs text-muted-foreground">
              {config.description}
            </p>
            
          </div>
         <div className="flex items-center gap-4">
             <div
            className={cn(
              "p-2 rounded-full",
              active
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            
          </div>
          <span>Selected</span>

         </div>
        </CardContent>
      </Card>
    </Button>
  );
}
