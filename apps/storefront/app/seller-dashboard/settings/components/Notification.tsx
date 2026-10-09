import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Bell } from "lucide-react";



const Notification = () => {
  return (
    <div>
        <Card className="w-full shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex  font-normal items-center gap-3">
                <Bell className="text-chart-1" />   
              <p>
                Notifications
              </p>
            </CardTitle>
          </CardHeader>
         
          <CardContent className="space-y-5">

             <div className="flex justify-between bg-accent-foreground  items-center p-4 rounded-md">
            <div>
                <h1>Email Notifications</h1>
            <p className="text-sm text-muted-foreground/75">
             Receive order updates via email
            </p>
            </div>
            <Switch className="mt-2" />
          </div>
           <div className="flex justify-between bg-accent-foreground  items-center p-4 rounded-md">
            <div>
                <h1>New Order Alerts</h1>
            <p className="text-sm text-muted-foreground/75">
             Instant notification for new orders
            </p>
            </div>
            <Switch className="mt-2" />
          </div>
           <div className="flex justify-between bg-accent-foreground  items-center p-4 rounded-md">
            <div>
                <h1>Marketing Updates</h1>
            <p className="text-sm text-muted-foreground/75">
             Promotional tips and news
            </p>
            </div>
            <Switch className="mt-2" />
          </div>
           <div className="flex justify-between bg-accent-foreground  items-center p-4 rounded-md">
            <div>
                <h1>Customer Messages</h1>
            <p className="text-sm text-muted-foreground/75">
            Alert when customers send messages
            </p>
            </div>
            <Switch className="mt-2" />
          </div>  
            </CardContent>        
        
        </Card>
    </div>
  )
}

export default Notification;