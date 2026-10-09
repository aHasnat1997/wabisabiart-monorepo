import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff, MapPin, Lock, AlertTriangle } from "lucide-react";
import { currencyOptions, regionOptions } from "@/lib/country-options";
// import { Button } from "@/components/animate-ui/components/buttons/button";
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/animate-ui/primitives/base/alert-dialog";
import { RippleButton } from "@/components/animate-ui/components/buttons/ripple";
import SectionTitle from "@/components/SectionTitle";
import PublicProfile from "./PublicProfile";
import { User as UserType } from "@/types/auth";
import { profileInfo } from "@/lib/auth-server";

export default function AccountSettings() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileData, setProfileData] = useState<UserType>();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await profileInfo();
        setProfileData(response ?? undefined);
      } catch (error) {
        console.error(error);
      }
    };
    loadProfile();
  }, []);

  const handleSaveLocation = () => {
    //  to do
  };

  const handleChangePassword = () => {
    // to do
  };

  const handleCloseAccount = () => {
    // to do
  };

  return (
    <div className="max-w-4xl min-h-screen mx-auto p-2 space-y-6">
      <SectionTitle title="Account Settings" />

      {/* About You Section */}
      <PublicProfile key={profileData?.id} profileInfo={profileData} />

      {/* Location Section */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
        <div className="bg-card rounded-lg md:rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow duration-300">
          <div className="bg-chart-1 p-4">
            <div className="flex items-center gap-2 text-accent-foreground">
              <MapPin className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Location</h2>
            </div>
          </div>
          <div className="p-3 md:p-6">
            <p className="text-muted-foreground mb-4">
              Set where you live, what language you speak, and the currency you
              use
            </p>

            <div className="space-y-4">
              {/* Region */}
              <div className="space-y-2 transition-all duration-200 hover:translate-x-1">
                <Label className="font-medium">Region</Label>

                <Select defaultValue="US">
                  <SelectTrigger className="w-full bg-background h-9! text-sm md:text-base px-4 md:px-6 md:h-11!">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>

                  <SelectContent>
                    {regionOptions.map((country) => (
                      <SelectItem key={country.value} value={country.value}>
                        <span>
                          {country.flag} {country.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Language (Read Only) */}
              <div className="space-y-2">
                <Label className="font-medium">Language</Label>

                <div className="h-9 md:h-11 text-sm md:text-base flex items-center rounded-md border bg-muted px-3">
                  English
                </div>
              </div>

              {/* Currency */}
              <div className="space-y-2 transition-all duration-200 hover:translate-x-1">
                <Label className="font-medium">Currency</Label>

                <Select defaultValue="USD">
                  <SelectTrigger className="w-full h-9! text-sm md:text-base md:h-11! bg-background">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>

                  <SelectContent>
                    {currencyOptions.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.symbol} {c.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <RippleButton
                className="bg-chart-1 hover:bg-chart-1/90 rounded-full h-9 md:h-11 text-sm md:text-base px-4 md:px-6"
                onClick={handleSaveLocation}
              >
                Save
              </RippleButton>
            </div>
          </div>
        </div>
      </div>

      {/* Password Section */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
        <div className="bg-card rounded-lg md:rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow duration-300">
          <div className="bg-secondary p-4">
            <div className="flex items-center gap-2 text-secondary-foreground">
              <Lock className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Password</h2>
            </div>
          </div>
          <div className="p-3 md:p-6">
            <div className="space-y-4">
              <div className="space-y-2 transform transition-all duration-200 hover:translate-x-1">
                <Label
                  htmlFor="current-password"
                  className="font-medium text-foreground"
                >
                  Current Password
                </Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Enter your current password"
                    className="pr-10 transition-all duration-200  h-9 md:h-11 text-sm md:text-base px-4 md:px-6 focus:ring-2 focus:ring-ring bg-background"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground rounded-full hover:text-foreground transition-colors"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2 transform transition-all duration-200 hover:translate-x-1">
                <Label
                  htmlFor="new-password"
                  className="font-medium text-foreground"
                >
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    className="pr-10 transition-all duration-200 focus:ring-2 h-9 md:h-11 text-sm md:text-base px-4 md:px-6 focus:ring-ring bg-background"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2 transform transition-all duration-200 hover:translate-x-1">
                <Label
                  htmlFor="confirm-password"
                  className="font-medium text-foreground"
                >
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    className="pr-10 transition-all duration-200 h-9 md:h-11 text-sm md:text-base px-4 md:px-6 focus:ring-2 focus:ring-ring bg-background"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <RippleButton
                className="rounded-full h-9 md:h-11 text-sm md:text-base px-4 md:px-6"
                variant={"secondary"}
                onClick={handleChangePassword}
              >
                Change Password
              </RippleButton>
            </div>
          </div>
        </div>
      </div>

      {/* Close Account Section */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
        <div className="bg-card rounded-lg md:rounded-xl border border-destructive/30 overflow-hidden hover:shadow-md transition-shadow duration-300">
          <div className="bg-destructive p-4">
            <div className="flex items-center gap-2 text-destructive-foreground">
              <AlertTriangle className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Close your account</h2>
            </div>
          </div>
          <div className="p-3 md:p-6">
            <p className="text-foreground mb-3 font-medium">
              What happens when you close your account?
            </p>
            <ul className="space-y-2 mb-4 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-0.5">•</span>
                <span>Your account will be inactive until you reopen it.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-0.5">•</span>
                <span>Your profile will no longer appear anywhere on.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-0.5">•</span>
                <span>We will close any non-delivery cases you opened.</span>
              </li>
            </ul>
            <p className="text-foreground text-sm mb-4">
              Want to permanently delete your account instead? Go to your
              Privacy Settings and click Request deletion of your data.
            </p>

            <AlertDialog>
              <AlertDialogTrigger className="transition-all cursor-pointer bg-destructive text-card font-medium duration-200 hover:scale-103 ease-in-out rounded-full h-9 md:h-11 text-sm md:text-base px-4 md:px-6">
                Close Account
              </AlertDialogTrigger>

              <AlertDialogPortal>
                <AlertDialogBackdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
                <AlertDialogPopup
                  className="sm:max-w-md fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] z-50 
                 border bg-background p-6 rounded-md shadow-lg"
                >
                  <AlertDialogHeader className="space-y-2">
                    <AlertDialogTitle className="text-lg font-semibold text-destructive">
                      Permanently Delete Account?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-sm text-muted-foreground">
                      This action cannot be undone. All your orders, wishlists,
                      addresses, and personal data will be permanently removed
                      from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <AlertDialogFooter className="mt-6 flex justify-end gap-3">
                    <AlertDialogClose className="px-4 py-2 cursor-pointer text-sm font-medium rounded-md border-secondary border hover:bg-muted/80 transition-colors">
                      Cancel
                    </AlertDialogClose>
                    <AlertDialogClose
                      onClick={handleCloseAccount}
                      className="px-4 py-2 text-sm cursor-pointer font-medium rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                    >
                      Delete Account
                    </AlertDialogClose>
                  </AlertDialogFooter>
                </AlertDialogPopup>
              </AlertDialogPortal>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}
