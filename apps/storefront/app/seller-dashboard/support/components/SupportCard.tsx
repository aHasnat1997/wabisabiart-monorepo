
import { Button } from "@/components/animate-ui/components/buttons/button";
import { Card, CardContent } from "@/components/ui/card"
import { SupportCardItem } from "@/types/sellerDashboard/Support";


interface SupportCardProps {
  data: SupportCardItem[];
}


const SupportCard = ({data}: SupportCardProps) => {
  return (
    <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.map((item) => (
                  <Card key={item.id} className="p-4 hover:shadow-md transition">
                    <div className="flex justify-between">
                     <div>
                       {item.icon && (
                        <div
                          className={`p-2 rounded-lg ${
                            item.color ?? "bg-primary/10"
                          } text-primary`}
                        >
                          {item.icon}
                        </div>
                      )}
                     </div>
                       
                    </div>
                    <CardContent className="p-0 space-y-2">
                      {/* TOP */}
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-muted-foreground">
                          {item.title}
                        </p>
                      </div>
        
                      {/* VALUE */}
                      <div className="text-xs font-normal text-muted-foreground">
                        
                        {item.value}
                      </div>
                      {item.button && (
              <Button
                size="lg"
                variant={item.button.variant ?? "default"}
                onClick={item.button.onClick}
                className={`${item.textColor} w-full cursor-pointer my-3`}
              >
                {item.button.label}
              </Button>
            )}
                      
                    </CardContent>
                  </Card>
                ))}
              </div>
    </div>
  )
}

export default SupportCard;