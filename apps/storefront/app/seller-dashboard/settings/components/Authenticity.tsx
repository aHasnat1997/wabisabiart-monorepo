"use client";
import { BadgeCheck, CalendarPlus2, Loader2 } from "lucide-react";
import AuthenCard from "./authenticity/AuthenCard";
import AuthenticityVerify from "./authenticity/AuthenticityVerify";
import AuthenticityAction from "./authenticity/AuthenticityAction";
import { IAuthenticityCardItem } from "@/types/sellerDashboard/Settings";
import { getAuthenticityStatus } from "./SecurityAction";
import { useEffect, useState } from "react";

interface SellerProfile {
  isVerifiedByAdmin: boolean;
  verificationDate: string | null;
  createdAt: string | null;
}

const Authenticity =  () => {

 const [data, setData] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await getAuthenticityStatus() as { success: boolean; data: { sellerProfile: SellerProfile } };
        if (res && res.success) {
          setData(res.data.sellerProfile);
        }
      } catch (error) {
        console.error("Failed to load authenticity status", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Not Verified Yet";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const authenticity: IAuthenticityCardItem[] = [
    {
      id: 1,
      title: "Badge Status",
      value: data?.isVerifiedByAdmin ? "Verified Maker" : "Pending Verification",
      icon: <BadgeCheck className="w-4 h-4" />,
      color: data?.isVerifiedByAdmin ? "bg-emerald-500/80 text-card" : "bg-orange-500/80 text-card",
      textColor: "bg-card text-muted-foreground",
    },
    {
      id: 2,
      title: "Last Verified",
      value: formatDate(data?.verificationDate),
      icon: <CalendarPlus2 className="w-4 h-4" />,
      color: "bg-chart-1/65 text-card",
      textColor: "bg-card text-chart-1",
    },
    {
      id: 3,
      title: "Next Review",
      value: formatDate(data?.createdAt),
      icon: <CalendarPlus2 className="w-4 h-4" />,
      color: "bg-chart-6/65 text-card",
      textColor: "bg-card text-chart-2",
    },
  ];

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Cards */}
      <AuthenCard data={authenticity} />

      {/* Verify + Action */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <AuthenticityVerify isVerified={data?.isVerifiedByAdmin || false} sampleProductsCount={0} />
        </div>
        <div className="flex-1">
          <AuthenticityAction isVerified={data?.isVerifiedByAdmin || false} />
        </div>
      </div>
    </div>
  );
};

export default Authenticity;
