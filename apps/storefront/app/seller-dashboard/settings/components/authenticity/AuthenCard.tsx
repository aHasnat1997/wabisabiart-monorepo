import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { IAuthenticityCardItem } from "@/types/sellerDashboard/Settings";


interface AuthenCardProps {
  data: IAuthenticityCardItem[];
}


const AuthenCard = ({data}: AuthenCardProps) => {
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
                       <div>
                        {item.badge && (
                        <Badge  className={`p-2 rounded-lg ${
                            item.textColor ?? "text-chart-4"
                          } `}>{item.badge}</Badge>
                      )}
                       </div>
                    </div>
                    <CardContent className="p-0 space-y-3">
                      {/* TOP */}
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-[#4A5565]">
                          {item.title}
                        </p>
                      </div>
        
                      {/* VALUE */}
                      <div className="text-lg font-normal">
                        {item.prefix}
                        {item.value}
                      </div>
                      {/* PERIOD */}
                      {item.period && (
                        <p className="text-xs text-primary">{item.period}</p>
                      )}
                      
                    </CardContent>
                  </Card>
                ))}
              </div>
    </div>
  )
}

export default AuthenCard;