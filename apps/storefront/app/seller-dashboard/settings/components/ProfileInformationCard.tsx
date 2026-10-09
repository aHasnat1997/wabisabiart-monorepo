"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserRound } from "lucide-react";
import { useForm } from "react-hook-form";
import z from "zod";
import { updateProfileSecurity } from "./SecurityAction";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { User } from "@/types/auth";


const ProfileInformationSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Phone number is required")
});


type ProfileInformationForm = z.infer<typeof ProfileInformationSchema>

const ProfileInformationCard = ({ profileData }: { profileData: User }) => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileInformationForm>({
    resolver: zodResolver(ProfileInformationSchema),
    defaultValues: {
      fullName: profileData?.fullName || "",
      email: profileData?.email || "",
      phoneNumber: profileData?.phoneNumber || "",
    },
  });

  useEffect(() => {
    if (profileData) {
      reset({
        fullName: profileData?.fullName || "",
        email: profileData?.email || "",
        phoneNumber: profileData?.phoneNumber || "",
      });
    }
  }, [profileData, reset]);

  const onSubmit = async (data: ProfileInformationForm) => {
    setLoading(true);
    try {
      const res = await updateProfileSecurity(data);

      if (res.success) {
        toast.success(res.message || "Profile updated successfully ");
      } else {
        toast.error(res.message || "Something went wrong");
      }
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to connect to server",
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full shadow-md">
        <CardContent className="flex justify-center p-10">
          <Loader2 className="animate-spin h-6 w-6 text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="text-lg flex  font-normal items-center gap-3">
          <UserRound className="text-primary" />
          <p>Profile Information</p>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" {...register("fullName")} className="bg-muted" />
            {errors.fullName && (
              <p className="text-sm text-destructive">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              className="bg-muted"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              {...register("phoneNumber")}
              className="bg-muted"
            />
            {errors.phoneNumber && (
              <p className="text-sm text-destructive">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>

          {/* Button */}
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/80 text-card "
          >
            Save Changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileInformationCard;
