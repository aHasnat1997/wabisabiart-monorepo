import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { Switch } from "@/components/animate-ui/components/headless/switch";
import SectionTitle from "@/components/SectionTitle";

export default function Privacy() {
  const [findAbilityEnabled, setFindAbilityEnabled] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleClearListings = () => {
    console.log("Clearing recently viewed listings...");
    // Add your logic here
  };

  const handleDownloadData = () => {
    setIsDownloading(true);
    console.log("Requesting data download...");
    // Simulate processing
    setTimeout(() => {
      setIsDownloading(false);
    }, 2000);
  };

  const handleDeleteAccount = () => {
    console.log("Requesting account deletion...");
    // Add your logic here
  };

  const handleSaveFindability = () => {
    console.log("Saving findability settings:", findAbilityEnabled);
    // Add your logic here
  };

  return (
    <div className="max-w-4xl min-h-screen mx-auto p-2 space-y-6">
      <SectionTitle title="Privacy Settings" />

      {/* Recently Viewed Listings */}
      <div className="space-y-3">
        <h2 className="text-lg md:text-2xl text-foreground font-semibold">
          Your recently viewed Listings
        </h2>
        <p className="text-muted-foreground text-sm md:text-base">
          Clear your recently viewed listings and we will no longer show them on
          the site. Listings that you view in the future will be recorded.
        </p>
        <Button
          size={"sm"}
          variant="outline"
          onClick={handleClearListings}
          className="rounded-full px-4"
        >
          Clear recently viewed listings
        </Button>
      </div>

      <Separator />

      {/* Download Data */}
      <div className="space-y-3">
        <h2 className="text-lg md:text-2xl text-foreground font-semibold">
          Download Data
        </h2>
        <p className="text-muted-foreground text-sm md:text-base">
          Download a ZIP file of your personal information, provided in both CSV
          and JSON file formats.
        </p>

        <Button
          size={"sm"}
          disabled={isDownloading}
          variant="outline"
          onClick={handleDownloadData}
          className="rounded-full px-4"
        >
          {isDownloading ? "Downloading..." : "Download data"}
        </Button>
      </div>

      <Separator />

      {/* Delete Account */}
      <div className="space-y-3">
        <h2 className="text-lg md:text-2xl text-foreground font-semibold">
          Permanently close and delete your account
        </h2>
        <p className="text-muted-foreground text-sm md:text-base">
          Permanently close and delete your account. Once deleted, your account
          cannot be restored.
        </p>
        <Button
          size={"sm"}
          variant="outline"
          onClick={handleDeleteAccount}
          className="rounded-full px-4"
        >
          Request deletion of your data
        </Button>
      </div>

      <Separator />

      {/* Findability Settings */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg md:text-2xl text-foreground font-semibold">
            Findability Settings
          </h2>
          <Switch
            checked={findAbilityEnabled}
            onChange={(checked) =>
              setFindAbilityEnabled(
                typeof checked === "boolean" ? checked : !findAbilityEnabled,
              )
            }
          />
        </div>
        <p className="text-muted-foreground text-sm md:text-base">
          Do you want others to be able to find you by your email address? Your
          email address will not be publicly displayed.
        </p>
        <Button
          size={"sm"}
          variant="outline"
          onClick={handleSaveFindability}
          className="rounded-full px-4"
        >
          Save findability Settings
        </Button>
      </div>
    </div>
  );
}
