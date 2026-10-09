"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/animate-ui/components/buttons/button"; 
import { Button as Bbutton } from "@/components/ui/button"; 
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, Loader2, Lock, Smartphone, TriangleAlert } from "lucide-react";
import { ChangePasswordForm, changePasswordSchema } from "./ChangePasswordSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { apiFetch } from "@/lib/apiFetch";
import { updateSecurityPassword } from "../SecurityAction";
import { profileInfo } from "@/lib/auth-server";


const logInActivity = [
  { id: 1, name: "MacBook Pro", location: "Accra, Ghana", date: "2026-01-20 09:25 AM (GMT)" },
  { id: 2, name: "iPhone 14 Pro", location: "Kumasi, Ghana", date: "2026-01-19 06:40 PM (GMT)" },
  { id: 3, name: "Dell XPS 15", location: "Dhaka, Bangladesh", date: "2026-01-18 11:10 AM (GMT+6)" },
  { id: 4, name: "Samsung Galaxy S23", location: "London, United Kingdom", date: "2026-01-17 08:55 AM (GMT)" },
];

const SecurityCard = () => {
  //  2FA state
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);

const [userId, setUserId] = useState<string>("");


useEffect(() => {

  profileInfo()
  .then((data) => {
    setUserId(data?.id ?? "")
     setTwoFAEnabled(data?.twoFactorEnabled ?? false)
  })
  .catch((err) => {
      console.error("❌ error:", err);
    })

}, [])




  // Step 1: OTP 
const handleSendOtp = async () => {
  if (!userId) {
    toast.error("Profile not loaded. Please refresh.");
    return;
  }
  setLoading(true);
  try {
    const data = await apiFetch<{ success: boolean }>("/user/two-factor-otp", {
  method: "POST",
  body: { userId, provider: "email" },
});
    if (data.success) {
      setOtpSent(true);
      toast.success("OTP sent to your email!");
    }
  } catch {
    toast.error("Failed to send OTP");
  } finally {
    setLoading(false);
  }
};

const handleToggle2FA = async () => {
  if (!otp) return toast.error("Please enter OTP");
  setLoading(true);
  try {
    const data = await apiFetch<{ success: boolean }>("/user/toggle-two-factor-verification", {
      method: "POST",
      body: { userId, otp, provider: "email", twoFactorEnable: !twoFAEnabled },
    });
    if (data.success) {
      setTwoFAEnabled((prev) => !prev);
      setOtpSent(false);
      setOtp("");
      toast.success(`2FA ${!twoFAEnabled ? "enabled" : "disabled"} successfully!`);
    }
  } catch {
    toast.error("Invalid OTP");
  } finally {
    setLoading(false);
  }
};

  // Change Password form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async(data: ChangePasswordForm) => {
    setLoading(true);
    try {
      const response = await updateSecurityPassword(
        data.currentPassword,
        data.newPassword,
        data.confirmPassword
      );
      if (response.success) {
        toast.success("Password updated successfully!");
      } else {
        toast.error(response.message || "Failed to update password");
      }
      
    } catch (error) {
      console.error("Password Update Error:", error);
      toast.error("Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">

      {/* 2FA Card */}
      <div className="flex flex-col md:flex-row gap-4">
        <Card className="w-full md:flex-1 mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Smartphone className="text-chart-4" />
              <p>Two-Factor Authentication</p>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* SMS / Email 2FA */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-chart-2/5 p-4 rounded-md">
              <div>
                <h1>Email Authentication</h1>
                <p className="text-sm text-muted-foreground/75">
                  {twoFAEnabled ? "2FA is currently enabled" : "2FA is currently disabled"}
                </p>
              </div>
              <Badge className={twoFAEnabled ? "bg-chart-2" : "bg-muted-foreground/10 text-muted-foreground"}>
                {twoFAEnabled ? "Active" : "Inactive"}
              </Badge>
            </div>

            {/* OTP Flow */}
            <p className="text-xs text-red-500">userId: {userId || "EMPTY"}</p>
            {!otpSent ? (
              <Bbutton 
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full bg-chart-4 hover:bg-chart-4/80 text-card"
              >
                {loading ? "Sending OTP..." : `${twoFAEnabled ? "Disable" : "Enable"} 2FA — Send OTP`}
              </Bbutton>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  OTP sent to your email. Enter it below:
                </p>
                <Input
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <div className="flex gap-2">
                  <Bbutton
                    onClick={handleToggle2FA}
                    disabled={loading}
                    className="flex-1 bg-chart-4 text-card"
                  >
                    {loading ? "Verifying..." : "Verify & Confirm"}
                  </Bbutton>
                  <Button
                    variant="outline"
                    onClick={() => { setOtpSent(false); setOtp(""); }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Authenticator App */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-accent-foreground p-4 rounded-md">
              <div className="flex-1">
                <h1>Authenticator App</h1>
                <p className="text-sm mb-2 text-muted-foreground/75">
                  Use Google Authenticator or similar apps
                </p>
                <Button className="bg-chart-4">Setup Authenticator</Button>
              </div>
              <Badge className="bg-muted-foreground/10 text-muted-foreground mt-2 sm:mt-0">
                Not setup
              </Badge>
            </div>

            {/* Backup Codes */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-accent-foreground p-4 rounded-md">
              <div className="flex-1">
                <h1>Backup Codes</h1>
                <p className="text-sm text-muted-foreground/75">
                  Use when you do not have your phone
                </p>
                <Button className="bg-muted text-muted-foreground border border-muted-foreground mt-2">
                  View Codes
                </Button>
              </div>
              <Badge className="bg-muted-foreground/10 text-muted-foreground mt-2 sm:mt-0">
                5 remaining
              </Badge>
            </div>

          </CardContent>
        </Card>
      </div>

      {/* Change Password */}
      <Card className="w-full mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Lock className="text-chart-4" />
            <span>Change Password</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1">
              <Label>Current Password</Label>
              <Input type="password" {...register("currentPassword")} className="bg-muted p-2 mt-1" />
              {errors.currentPassword && <p className="text-sm text-destructive">{errors.currentPassword.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>New Password</Label>
              <Input type="password" {...register("newPassword")} className="bg-muted p-2 mt-1" />
              {errors.newPassword && <p className="text-sm text-destructive">{errors.newPassword.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Confirm New Password</Label>
              <Input type="password" {...register("confirmPassword")} className="bg-muted p-2 mt-1" />
              {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
            </div>
            <div className="p-3 bg-chart-1/20 space-y-2 rounded-xl text-sm">
              Password must be at least 8 characters with uppercase, lowercase, numbers, and symbols.
            </div>
           <Bbutton type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/75 text-card h-11">
  {loading ? (
    <span className="flex items-center gap-2">
      <Loader2 className="animate-spin h-4 w-4" /> Updating...
    </span>
  ) : (
    "Update Password"
  )}
</Bbutton>
          </form>
        </CardContent>
      </Card>

      {/* Recent Login Activity */}
      <Card className="w-full mt-6">
        <CardHeader>
          <CardTitle className="flex gap-3 items-center">
            <Eye className="text-chart-1" />
            <p className="font-normal">Recent Login Activity</p>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {logInActivity.map((data) => (
              <div key={data.id} className="bg-accent-foreground p-4 rounded-md flex flex-col">
                <h1 className="font-medium">{data.name}</h1>
                <p className="text-sm mb-2 text-muted-foreground/75">{data.location}</p>
                <h4 className="text-sm">{data.date}</h4>
              </div>
            ))}
          </div>
          <Bbutton className="w-full flex gap-2 mt-3 hover:bg-destructive/40 bg-destructive/70 text-destructive">
            <TriangleAlert />
            <span>Log Out All Devices</span>
          </Bbutton>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityCard;