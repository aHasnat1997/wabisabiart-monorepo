"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeCheck, Calendar, Newspaper, Upload, Video, Loader2 } from "lucide-react";
import { toast } from "sonner"; 
import { submitAuthenticityProof } from "../SecurityAction";

interface Props {
  isVerified: boolean;
}

const AuthenticityAction = ({ isVerified }: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUploadProof = async () => {

    if (isVerified) return;
    setIsSubmitting(true);

    const payload = {
      shopName: "Amina's Handcrafts",
      shopDescription: "Authentic handmade textiles and jewelry.",
      address: "Accra, Ghana",
      proofOfIdentity: "/media/id-proof.png", 
      isAgreedToTermsAndConditions: true,
      isHandcraftedOrEthicallySourced: true
    };

    try {
      const res = await submitAuthenticityProof(payload) as { success: boolean; message?: string };
      
      if (res?.success) {
        toast.success(res.message || "Authenticity proof submitted successfully! Our team will review it shortly.");
      } else {
        toast.error(res?.message || "Something went wrong! ");
      }
    } catch (error) {
      toast.error("Failed to connect to the server.");
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <Card className="w-full shadow-md border-2">
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Upload Button with API Integration */}
          <Button 
            variant="outline" 
            className="w-full flex items-center gap-3 justify-start h-11" 
            disabled={isVerified || isSubmitting}
            onClick={handleUploadProof}
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin h-5 w-5 text-primary" />
            ) : (
              <Upload size={20} className="text-primary" />
            )}
            <span>{isVerified ? "Proof Already Verified" : "Upload New Proof"}</span>
          </Button>

          <Button 
            variant="outline" 
            className="w-full flex items-center gap-3 justify-start h-11" 
            disabled={isVerified || isSubmitting}
             onClick={handleUploadProof}
          >
            <Video size={20} className="text-chart-8" />
            <span>Upload Video Proof</span>
          </Button>

          <Button variant="outline" className="w-full flex items-center gap-3 justify-start h-11">
            <Calendar size={20} className="text-chart-7" />
            <span>Schedule Review Call</span>
          </Button>

          <Button variant="outline" className="w-full flex items-center gap-3 justify-start h-11">
            <Newspaper size={20} className="text-chart-6" />
            <span>Review Requirements</span>
          </Button>
        </CardContent>
      </Card>

      {/* Benefits Section - Visual fix */}
      <div className="p-5 border bg-primary/5 rounded-2xl border-primary/65 shadow-sm">
        <h3 className="font-bold mb-4 text-sm text-primary uppercase tracking-tight">
          Authenticity Benefits
        </h3>
        <div className="space-y-3">
          {[
            "Verified badge on all your products",
            "Higher search ranking priority",
            "Featured in Authentic Makers collection",
            "Customer trust and confidence boost",
          ].map((benefit, index) => (
            <div key={index} className="flex gap-3 items-start">
              <BadgeCheck size={18} className="text-primary shrink-0" />
              <p className="text-xs font-medium text-primary/85 leading-relaxed">
                {benefit}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuthenticityAction;