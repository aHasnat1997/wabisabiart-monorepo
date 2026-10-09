"use client";
import { BadgeCheck, CalendarPlus2, Loader2 } from "lucide-react";
import AuthenCard from "./authenticity/AuthenCard";
import SecurityCard from "./security/SecurityCard";
import { IAuthenticityCardItem } from "@/types/sellerDashboard/Settings";
import { useEffect, useState } from "react";
import { getSettingsOverview } from "./SecurityAction";
import { formatDate } from "../../customers/components/DateFormat";


interface SecurityData {
  twoFactorEnabled: boolean;
  otpProvider: string;
  lastLoginAt: string | null;
}

const Security = () => {

  const [securityData, setSecurityData] = useState<SecurityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSecurityData = async () => {
      try {
        const res = await getSettingsOverview();
        if (res?.success) {
      
        setSecurityData(res.data.security);
      }
      } catch (error) {
        console.error("Security Data Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSecurityData();
  }, []);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }
 
const securityItems: IAuthenticityCardItem[] = [
    {
      id: 1,
      title: "Security Score",
      value: "85/100",
      icon: <BadgeCheck className="w-4 h-4" />,
      color: "bg-chart-4 text-white",
      textColor: "bg-card text-muted-foreground",
    },
    {
      id: 2,
      title: "Two-Factor Auth",
      value: securityData?.twoFactorEnabled ? "Enabled" : "Disabled",
      icon: <CalendarPlus2 className="w-4 h-4" />,
      color: securityData?.twoFactorEnabled ? "bg-chart-1 text-white" : "bg-red-500/60 text-white",
      textColor: "bg-card text-chart-1",
    },
    {
      id: 3,
      title: "Last Login",
      value: formatDate(securityData?.lastLoginAt || "") || "No records",
      icon: <CalendarPlus2 className="w-4 h-4" />,
      color: "bg-chart-6 text-white",
      textColor: "bg-card text-chart-2",
    },
  ];
  return (
 <div className="w-full flex flex-col gap-6">
      {/* Top Cards */}
      <AuthenCard data={securityItems} />

      {/* Security Details */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 min-w-0">
          <SecurityCard />
        </div>
      </div>
    </div>
  )
}

export default Security;