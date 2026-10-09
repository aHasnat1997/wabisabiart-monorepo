import { useCallback, useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { Button } from "@/components/animate-ui/components/buttons/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import SectionTitle from "@/components/SectionTitle";
import { getAllSessions, signoutAllSessions, signoutSession } from "./action";
import { SessionType } from "@/types/auth";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

export default function Security() {
  const [phoneNumber, setPhoneNumber] = useState("19625966358");
  const [is2FAOn, setIs2FAOn] = useState(false);
  const [sessions, setSessions] = useState<SessionType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    const data = await getAllSessions();
    setIsLoading(false);
    if (data) {
      setSessions(data);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    (async () => {
      const data = await getAllSessions();
      setIsLoading(false);
      if (!ignore && data) {
        setSessions(data);
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);

  const handleSignOutEverywhere = async () => {
    try {
      const res = await signoutAllSessions();
      toast.success(
        res?.message || "Signed out from all sessions successfully",
      );
      fetchSessions();
    } catch (error) {
      console.error("Error signing out from all sessions:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to sign out from all sessions",
      );
    }
  };

  const handleSignOut = async (sessionId: string) => {
    try {
      const res = await signoutSession(sessionId);
      toast.success(res?.message || "Signed out from the session successfully");
      fetchSessions();
    } catch (error) {
      console.error("Error signing out from the session:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to sign out from the session",
      );
    }
  };

  return (
    <div className="max-w-4xl min-h-screen mx-auto p-2 space-y-6">
      <SectionTitle title="Security Settings" />

      <div className="bg-card rounded-lg p-3 md:p-6 border hover:shadow-md transition-shadow duration-300">
        <h2 className="text-lg md:text-xl text-foreground font-medium mb-2">
          Your mobile phone number
        </h2>
        <p className="text-muted-foreground text-sm md:text-base mb-4">
          We need this info to verify your identity and help protect your
          account. We won&apos;t share this number with third parties.
        </p>

        <div className="flex flex-col md:flex-row gap-3 md:items-end">
          <div className="flex-1">
            <Label className="text-sm font-medium mb-2 block">
              Mobile Number*
            </Label>
            <PhoneInput
              defaultCountry="US"
              value={phoneNumber}
              onChange={(phone) => setPhoneNumber(phone)}
              inputClassName="!h-9! md:h-11! rounded-full text-sm! md:text-base! !border  !rounded-md !text-foreground placeholder:!text-muted-foreground !w-full"
              countrySelectorStyleProps={{
                buttonClassName:
                  "h-9! md:h-11! rounded-full text-sm! md:text-base! !bg-background !rounded-md !px-6 !mr-2 !border",
              }}
              className="phone-input-wrapper"
            />
          </div>

          <Button className="h-9 md:h-11 rounded-full text-sm md:text-base md:px-6">
            Send verification code
          </Button>
        </div>
      </div>

      {/* 2FA Section */}
      <div className="bg-card rounded-lg p-3 md:p-6 border hover:shadow-md transition-shadow duration-300">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-3">
          <h2 className="text-lg md:text-xl text-foreground font-medium mb-2">
            2 factor authentication (2FA):{" "}
            <span className="text-muted-foreground">Off</span>
          </h2>
          <Button
            onClick={() => setIs2FAOn(!is2FAOn)}
            className="rounded-full w-full md:w-auto text-sm md:px-6"
          >
            Turn 2FA On
          </Button>
        </div>

        <p className="text-muted-foreground text-sm md:text-base mb-4">
          Double your security with 2FA. You will be prompted to verify your
          identity if we notice any unusual activity on your account.
        </p>

        <div className="bg-primary text-card rounded-md font-medium p-2 md:p-3 flex items-start gap-2">
          <Info className="size-5 shrink-0" />
          <span className="text-sm">
            You will need to confirm your email to turn on two-factor
            authentication.
          </span>
        </div>
      </div>

      {/* Third-party Accounts Section */}
      {/* <div className="bg-card rounded-lg p-3 md:p-6 border hover:shadow-md transition-shadow duration-300">
        <h2 className="text-lg md:text-xl text-foreground font-medium mb-2">
          Third-party accounts
        </h2>
        <p className="text-muted-foreground text-sm md:text-base mb-4">
          Connect your third-party accounts to your account to sign in and check
          out faster. Once you have added a third-party account, you can
          disconnect it anytime here.
        </p>

        <div className="bg-background rounded-lg p-3 md:p-5">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3 justify-between pb-4 border-b-2">
            <div className="flex w-full items-center gap-3">
              <GoogleIcon />
              <span className="font-medium line-clamp-1">
                Connect your Google account
              </span>
            </div>
            <Button
              className="rounded-full w-full md:w-auto bg-card border-primary text-primary font-semibold"
              variant="outline"
            >
              Connect
            </Button>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-3 justify-between py-4 border-b-2">
            <div className="flex items-center gap-3">
              <FacebookIcon />
              <span className="font-medium line-clamp-1">
                Connect your Facebook account
              </span>
            </div>
            <Button
              className="rounded-full w-full md:w-auto bg-card border-primary text-primary font-semibold"
              variant="outline"
            >
              Connect
            </Button>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-3 justify-between pt-4">
            <div className="flex items-center gap-3">
              <AppleIcon />
              <span className="font-medium line-clamp-1">
                Connect your Apple account
              </span>
            </div>
            <Button
              className="rounded-full w-full md:w-auto bg-card border-primary text-primary font-semibold"
              variant="outline"
            >
              Connect
            </Button>
          </div>
        </div>
      </div> */}

      {/* Sign-in History Section */}
      <div className="bg-card rounded-lg p-3 md:p-6 border hover:shadow-md transition-shadow duration-300">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 justify-between mb-3">
          <h2 className="text-lg md:text-xl text-foreground font-medium">
            Review your sign-in history
          </h2>
          <Button
            disabled={isLoading}
            onClick={handleSignOutEverywhere}
            variant="destructive"
            className="rounded-full w-full md:w-auto text-sm md:text-base md:px-6"
          >
            Sign Out Every where {isLoading && <Spinner />}
          </Button>
        </div>

        <p className="text-muted-foreground text-sm md:text-base mb-4">
          Make sure you recognize all recent sign-in activity for your account.
          You can sign out anywhere you are still signed in.
        </p>

        <div className="overflow-x-auto -mx-6 px-6">
          <Table>
            <TableHeader>
              <TableRow className="border-b-2">
                <TableHead className="text-left font-semibold">Time</TableHead>
                <TableHead className="text-left font-semibold">
                  Browser / Device
                </TableHead>
                <TableHead className="text-left font-semibold">
                  Location
                </TableHead>
                <TableHead className="text-right font-semibold">
                  Status
                </TableHead>
                <TableHead className="text-right font-semibold">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {sessions.map((item) => (
                <TableRow
                  key={item.id}
                  className="hover:bg-muted/50 transition-colors border-b last:border-0"
                >
                  <TableCell className="py-4 font-medium">
                    {new Date(item.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="py-4">{item.device}</TableCell>
                  <TableCell className="py-4 text-muted-foreground">
                    {item.location}
                  </TableCell>
                  <TableCell
                    className={cn(
                      item.isActive ? "text-chart-1" : "text-destructive",
                      "py-4 text-right font-semibold",
                    )}
                  >
                    {item.isActive ? "Active" : "Signed out"}
                  </TableCell>
                  <TableCell className="py-4 text-right">
                    <Button
                      onClick={() => handleSignOut(item.id)}
                      variant="ghost"
                      size={"sm"}
                      className="text-xs border border-destructive/75 text-destructive hover:bg-destructive rounded-full "
                    >
                      Sign Out
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

// const signInHistory = [
//   {
//     time: "10 minutes ago",
//     browser: "Chrome 142 on Windows 11",
//     location: "Dhaka, Bangladesh",
//     status: "Sign In",
//   },
//   {
//     time: "5 minutes ago",
//     browser: "Firefox 105 on macOS Monterey",
//     location: "Tokyo, Japan",
//     status: "Sign out",
//   },
//   {
//     time: "2 minutes ago",
//     browser: "Safari 16 on iOS 16",
//     location: "Berlin, Germany",
//     status: "Sign out",
//   },
// ];
