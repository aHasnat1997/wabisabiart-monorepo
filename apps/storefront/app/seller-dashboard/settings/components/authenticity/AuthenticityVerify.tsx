
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { BadgeCheck, CheckCircle2, Clock, TriangleAlert, } from "lucide-react";

interface Props {
  isVerified: boolean;
  sampleProductsCount: number;
}

const AuthenticityVerify = ({ isVerified, sampleProductsCount }: Props) => {



  return (
  
        <Card className="w-full shadow-md">
            <CardHeader>
                <CardTitle>
                    Verification Step
                </CardTitle>
            </CardHeader>
<CardContent className="space-y-5">
        {/* Identify Verification */}
        <div className="flex justify-between bg-chart-2/5 items-center p-2 rounded-md">
          <div className="flex items-center gap-3">
            {isVerified ? <CheckCircle2 className="text-primary" /> : <Clock className="text-chart-7" />}
            <div>
              <h1 className="font-medium">Identity Verification</h1>
              <p className="text-sm text-muted-foreground/75">
                {isVerified ? "Government ID verified" : "ID verification in progress"}
              </p>
            </div>
          </div>
        </div>

        {/* Business Documentation */}
        <div className="flex justify-between bg-chart-2/5 items-center p-2 rounded-md">
          <div className="flex items-center gap-3">
            <BadgeCheck className={isVerified ? "text-primary" : "text-muted-foreground/50"} />
            <div>
              <h1 className="font-medium">Business Documentation</h1>
              <p className="text-sm text-muted-foreground/75">
                {isVerified ? "Maker credentials confirmed" : "Documents under review"}
              </p>
            </div>
          </div>
        </div>

        {/* Workshop Photos (Dynamic count from API) */}
        <div className="flex justify-between bg-chart-2/5 items-center p-2 rounded-md">
          <div className="flex items-center gap-3">
            <BadgeCheck className="text-chart-2/70" />
            <div>
              <h1 className="font-medium">Workshop Photos</h1>
              <p className="text-sm text-muted-foreground/75">
                {sampleProductsCount} photos uploaded
              </p>
            </div>
          </div>
        </div>

        {/* Annual Review Status */}
        <div className={`flex justify-between items-center p-2 rounded-md ${isVerified ? 'bg-chart-2/5' : 'bg-chart-3/5'}`}>
          <div className="flex items-center gap-3">
            {isVerified ? <BadgeCheck className="text-primary" /> : <TriangleAlert className="text-chart-3/80" />}
            <div>
              <h1 className="font-medium">Status Review</h1>
              <p className="text-sm text-muted-foreground/75">
                {isVerified ? "Review completed" : "Verification pending by admin"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
        </Card>
       
   
  )
}

export default AuthenticityVerify;




