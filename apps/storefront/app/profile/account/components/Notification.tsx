import React, { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { Mail } from "lucide-react";
import { Checkbox } from "@/components/animate-ui/components/base/checkbox";
import { Switch } from "@/components/animate-ui/components/headless/switch";
import SectionTitle from "@/components/SectionTitle";

export default function Notification() {
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const [securityAlertsEnabled, setSecurityAlertsEnabled] =
    useState<boolean>(true);
  const [phoneNumberAdded, setPhoneNumberAdded] = useState(false);

  // Email Notification Toggles
  const [messageReceived, setMessageReceived] = useState(true);
  const [messageSent, setMessageSent] = useState(false);
  const [followed, setFollowed] = useState(true);

  // Subscription Toggles
  const [newAndNotable, setNewAndNotable] = useState(true);
  const [feedback, setFeedback] = useState(true);
  const [couponsPromotions, setCouponsPromotions] = useState(true);
  const [forums, setForums] = useState(true);
  const [advocacy, setAdvocacy] = useState(true);
  const [newsFeatures, setNewsFeatures] = useState(true);
  const [patternNews, setPatternNews] = useState(true);

  const handleResendEmail = () => {
    console.log("Resending confirmation email...");
  };

  const handleAddPhoneNumber = () => {
    console.log("Adding phone number for security alerts...");
    setPhoneNumberAdded(true);
  };

  const handleSaveSettings = () => {
    console.log("Saving notification settings...");
  };

  return (
    <div className="max-w-4xl min-h-screen mx-auto p-2 space-y-6">
      <SectionTitle title="Notification Settings" />

      {/* Email Confirmation Section */}
      <div className="space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 justify-between">
          <h2 className="text-lg md:text-2xl text-foreground font-semibold">
            Make sure to confirm your email
          </h2>
          <div className="flex w-full md:w-auto gap-2">
            <Button
              size={"sm"}
              className="rounded-full w-1/2 md:w-auto"
              variant="outline"
              onClick={() => console.log("Change Email")}
            >
              Change Email
            </Button>
            <Button
              size={"sm"}
              className="rounded-full  w-1/2 md:w-auto"
              onClick={handleResendEmail}
            >
              Resend Email
            </Button>
          </div>
        </div>
        <p className="text-sm md:text-base text-muted-foreground">
          Follow the instructions in the email we sent to{" "}
          <span className="font-medium">yourmail@gmail.com</span>, so you
          don&apos;t miss any important messages or emails you have subscribed
          to.
        </p>
        {!emailConfirmed && (
          <div className="bg-primary text-card rounded-md font-medium p-3 flex items-start gap-2">
            <Mail className="size-5 shrink-0" />
            <span className="text-sm">
              You will need to confirm your email to turn on two-factor
              authentication.
            </span>
          </div>
        )}
      </div>

      <Separator />

      {/* Security Alerts — FIXED SWITCH */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg md:text-2xl text-foreground font-semibold">
            New: Turn on security alerts
          </h2>

          <Switch
            checked={securityAlertsEnabled}
            onChange={(checked) =>
              setSecurityAlertsEnabled(
                typeof checked === "boolean" ? checked : !securityAlertsEnabled,
              )
            }
          />
        </div>
        <p className="text-sm md:text-base text-muted-foreground">
          We will send you an SMS right away if we notice any unusual activity,
          so you can act fast to protect your account.
        </p>
        {!phoneNumberAdded && (
          <div className="bg-background px-4 py-2 text-sm rounded-md flex flex-col md:flex-row items-start gap-2 md:items-center justify-between">
            <span>
              To get security alerts, you&apos;ll first need to add and verify
              your mobile phone number.
            </span>
            <Button
              size={"sm"}
              className="rounded-full w-full md:w-auto"
              onClick={handleAddPhoneNumber}
            >
              Add phone number
            </Button>
          </div>
        )}
      </div>

      <Separator />

      {/* Email Notification Settings — FIXED CHECKBOXES */}
      <div className="space-y-3">
        <h2 className="text-lg md:text-2xl text-foreground font-semibold">
          Email notification settings for yourmail@gmail.com
        </h2>
        <p className="text-muted-foreground">Email me when...</p>

        <div className="space-y-2 md:pl-4">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={messageReceived}
              onCheckedChange={setMessageReceived}
            />
            <p>Someone sends me a Message</p>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={messageSent} onCheckedChange={setMessageSent} />
            <p>I send a Message</p>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={followed} onCheckedChange={setFollowed} />
            <p>Someone follows me</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Email Subscriptions — FIXED CHECKBOXES */}
      <div className="space-y-3">
        <h2 className="text-lg md:text-2xl text-foreground font-semibold">
          Email subscriptions for yourmail@gmail.com
        </h2>

        <div className="space-y-8">
          <div>
            <h3 className="font-medium text-foreground mb-2">General</h3>
            <div className="space-y-4 md:pl-4">
              <div className="flex items-start gap-2">
                <Checkbox
                  checked={newAndNotable}
                  onCheckedChange={setNewAndNotable}
                  className="mt-1"
                />
                <span>
                  <h5 className="font-medium">New and Notable</h5>
                  <p className="text-xs text-muted-foreground">
                    Get the very best of — from new trends and recommendations,
                    to our biggest sales events and collaborations — delivered
                    right to your inbox.
                  </p>
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Checkbox
                  checked={feedback}
                  onCheckedChange={setFeedback}
                  className="mt-1"
                />
                <span>
                  <h5 className="font-medium">Feedback</h5>
                  <p className="text-xs text-muted-foreground">
                    Share feedback and help us improve your experience through
                    occasional marketing surveys or interviews.
                  </p>
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Checkbox
                  checked={couponsPromotions}
                  onCheckedChange={setCouponsPromotions}
                  className="mt-1"
                />
                <span>
                  <h5 className="font-medium">Coupons and Promotions</h5>
                  <p className="text-xs text-muted-foreground">
                    Stay in the know about the finds you love — be the first to
                    learn about sales and special offers.
                  </p>
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Checkbox
                  checked={forums}
                  onCheckedChange={setForums}
                  className="mt-1"
                />
                <span>
                  <h5 className="font-medium">Forums</h5>
                  <p className="text-xs text-muted-foreground">
                    Keep up with the conversation through notifications for
                    Forums and Teams.
                  </p>
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Checkbox
                  checked={advocacy}
                  onCheckedChange={setAdvocacy}
                  className="mt-1"
                />
                <span>
                  <h5 className="font-medium">Advocacy</h5>
                  <p className="text-xs text-muted-foreground">
                    Learn how you can support the community. Join the Advocacy
                    movement.
                  </p>
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-2">For Seller</h3>
            <div className="space-y-4 md:pl-4">
              <div className="flex items-start gap-2">
                <Checkbox
                  checked={newsFeatures}
                  onCheckedChange={setNewsFeatures}
                  className="mt-1"
                />
                <span>
                  <h5 className="font-medium">News and Features</h5>
                  <p className="text-xs text-muted-foreground">
                    Receive regular updates on how is doing — and how we are
                    growing.
                  </p>
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Checkbox
                  checked={patternNews}
                  onCheckedChange={setPatternNews}
                  className="mt-1"
                />
                <span>
                  <h5 className="font-medium">Pattern News</h5>
                  <p className="text-xs text-muted-foreground">
                    Get the most out of your Pattern site. Get our latest
                    articles, tips, and seller resources delivered right to your
                    inbox.
                  </p>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Save Settings Button */}
      <div className="pt-4">
        <Button
          variant="default"
          onClick={handleSaveSettings}
          className="rounded-full h-9 md:h-11 text-sm md:text-base px-4 md:px-6"
        >
          Save Settings
        </Button>
      </div>
    </div>
  );
}