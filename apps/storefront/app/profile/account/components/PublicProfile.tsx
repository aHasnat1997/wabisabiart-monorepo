"use client";

import { useState } from "react";
import { Camera, ChevronDown, Loader2 } from "lucide-react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { User } from "@/types/auth";
import { getInitials } from "@/lib/getInitials";
import { useFileUpload } from "@/components/uploadFile";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { updateProfile } from "@/lib/auth-server";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import moment from "moment";

const profileSchema = z.object({
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  dob: z.string().optional(),
  avatarUrl: z.string().optional(),
});

type ProfileData = z.infer<typeof profileSchema>;

export default function PublicProfile({ profileInfo }: { profileInfo?: User }) {
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadedKey, setUploadedKey] = useState<string | null>(null);
  const [savedData, setSavedData] = useState<ProfileData>(() => ({
    fullName: profileInfo?.fullName || "",
    avatarUrl: profileInfo?.avatarUrl || "",
    dob: profileInfo?.dob || "No date specified",
  }));
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<ProfileData>(() => ({
    fullName: profileInfo?.fullName || "",
    avatarUrl: profileInfo?.avatarUrl || "",
    dob: profileInfo?.dob || "",
  }));

   const [open, setOpen] = useState(false);
   const [date, setDate] = useState<Date | undefined>(undefined);


  const {
    uploadedFile: uploadedProfileFile,
    localPreview: profileLocalPreview,
    isUploading: isProfileUploading,
    error: profileUploadError,
    handleUpload: handleProfileUpload,
    handleRemove: handleProfileRemove,
  } = useFileUpload({
    onUpload: (url, key) => {
      setFormData((prev) => ({ ...prev, avatarUrl: url }));
      setUploadedKey(key);
      console.log("Uploaded file URL:", url);
    },
    multiple: false,
  });

  const handleRemovePhoto = async () => {
    if (uploadedKey) {
      await handleProfileRemove(uploadedKey);
      setUploadedKey(null);
    }
    setFormData((prev) => ({ ...prev, avatarUrl: "" }));
  };

  const handleEdit = () => {
    setFormData(savedData);
    setErrors({});
    setIsEditing(true);
  };

  const handleCancel = async () => {
    // if a new file was uploaded but user cancels, remove it
    if (uploadedKey) {
      await handleProfileRemove(uploadedKey);
      setUploadedKey(null);
    }
    setFormData(savedData);
    setErrors({});
    setIsEditing(false);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const validatedData = profileSchema.parse(formData);

      const updateInfo = {
        fullName: validatedData.fullName,
        dob: date ? date.toISOString() : savedData.dob,
        avatarUrl: uploadedProfileFile?.url || "",
      };

      const res = await updateProfile(updateInfo);
      if (res.success) {
        toast.success(res.message || "Profile updated successfully");
      }

      setSavedData(validatedData);
      setErrors({});
      setIsEditing(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const avatarSrc =
    profileLocalPreview ||
    (uploadedProfileFile
      ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/${uploadedProfileFile.url}`
      : savedData.avatarUrl
        ? `${process.env.NEXT_PUBLIC_MEDIA_URL}${savedData.avatarUrl}`
        : "");

  const hasPhoto = Boolean(profileLocalPreview || formData.avatarUrl);

  return (
    <Card className="shadow-none py-3 md:py-6 hover:shadow-md rounded-md md:rounded-xl transition-shadow duration-300">
      <CardHeader className="px-3 md:px-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl md:text-3xl font-bold tracking-tight">
              Public Profile
            </CardTitle>
            <CardDescription className="mt-2">
              Manage your public profile information
            </CardDescription>
          </div>
          <Badge className="h-fit">Public</Badge>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="space-y-6 px-3 md:px-6">
        {/* Profile Picture */}
        <div className="space-y-4">
          <h4 className="text-base font-semibold">Profile Picture</h4>
          <div className="flex flex-col items-center gap-4">
            {/* only render file input in edit mode */}
            {isEditing && (
              <input
                type="file"
                id="profile-upload"
                className="hidden"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleProfileUpload}
                disabled={isProfileUploading}
              />
            )}

            <div
              className={cn(
                "relative group",
                isEditing && !isProfileUploading && "cursor-pointer",
              )}
              onClick={() =>
                isEditing &&
                !isProfileUploading &&
                document.getElementById("profile-upload")?.click()
              }
            >
              <Avatar className="w-32 h-32 border-4 border-primary/10 shadow-xl ring-4 ring-primary/5 transition-all group-hover:ring-primary/20 group-hover:shadow-2xl">
                <AvatarImage src={avatarSrc} alt={savedData.fullName} />
                <AvatarFallback className="text-3xl font-bold bg-linear-to-br from-primary/20 to-accent/20 text-primary">
                  {getInitials(savedData.fullName)}
                </AvatarFallback>
              </Avatar>

              {/* overlay only in edit mode */}
              {isEditing &&
                (isProfileUploading ? (
                  <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                ) : (
                  <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                ))}
            </div>

            {isEditing &&
              (hasPhoto ? (
                <Button
                  variant="link"
                  size="sm"
                  className="text-destructive"
                  onClick={handleRemovePhoto}
                  disabled={isProfileUploading}
                >
                  Remove Photo
                </Button>
              ) : (
                <p className="text-xs text-muted-foreground text-center max-w-xs">
                  Click on the avatar to upload a photo. JPG or PNG, smaller
                  than 10MB.
                </p>
              ))}

            {profileUploadError && (
              <p className="text-xs text-destructive">{profileUploadError}</p>
            )}
          </div>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-base font-semibold">
            Your Name
          </Label>
          {isEditing ? (
            <>
              <Input
                id="name"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                className={`h-9 md:h-11 bg-background ${errors.fullName ? "border-destructive" : ""}`}
                placeholder="Enter your name"
              />
              {errors.fullName && (
                <p className="text-xs text-destructive">{errors.fullName}</p>
              )}
            </>
          ) : (
            <div className="h-9 md:h-11 px-3 py-2 bg-muted/50 rounded-md border border-border flex items-center">
              <span className="text-foreground text-sm">
                {savedData.fullName}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dob" className="text-base font-semibold">
            Date of Birth
          </Label>
          {isEditing ? (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <button
                  id="date"
                  className={`flex items-center justify-between cursor-pointer px-4 w-full border rounded-md text-sm font-normal h-9 md:h-11 bg-background ${errors.dob ? "border-destructive" : ""}"`}
                >
                  {date ? date.toLocaleDateString() : "Select date"}{" "}
                  <ChevronDown size={16} />
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={date}
                  defaultMonth={date}
                  captionLayout="dropdown"
                  onSelect={(date) => {
                    setDate(date);
                    setOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          ) : (
            <div className="h-9 md:h-11 px-3 py-2 bg-muted/50 rounded-md border border-border flex items-center">
              <span className="text-foreground text-sm">
                {moment(profileInfo?.dob).format("MMMM D, YYYY")}
              </span>
            </div>
          )}
        </div>

        {/* Email — display only */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">Email</Label>
          <div className="h-9 md:h-11 px-3 py-2 bg-muted/50 rounded-md border border-border flex items-center">
            <span
              className={`text-sm ${profileInfo?.email ? "text-foreground" : "text-muted-foreground"}`}
            >
              {profileInfo?.email || "No email specified"}
            </span>
          </div>
        </div>

        {/* Phone — display only */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">Phone Number</Label>
          <div className="h-9 md:h-11 px-3 py-2 bg-muted/50 rounded-md border border-border flex items-center">
            <span
              className={`text-sm ${profileInfo?.phoneNumber ? "text-foreground" : "text-muted-foreground"}`}
            >
              {profileInfo?.phoneNumber || "+1 XXX XXX XXXX"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                className="rounded-full"
                onClick={handleCancel}
                disabled={isProfileUploading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="rounded-full hover:shadow-xl transition-all duration-300"
                disabled={isProfileUploading || loading}
              >
                Save Changes {loading && <Spinner />}
              </Button>
            </>
          ) : (
            <Button
              onClick={handleEdit}
              className="rounded-full hover:shadow-xl transition-all duration-300"
            >
              Edit Profile
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}