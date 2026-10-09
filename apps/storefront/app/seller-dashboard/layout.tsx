import { redirect } from "next/navigation";
import { SidebarProvider } from "@/components/animate-ui/components/radix/sidebar";
import DashboardLayoutContent from "./components/DashBoardLayoutContent";
import { Suspense } from "react";
import { profileInfo } from "@/lib/auth-server";
import { onboardingStatus } from "./components/action";
import Onboarding from "./components/Onboarding";
import ShopPendingPage from "./components/ShopPending";
import ShopSetupIncompletePage from "./components/ShopSetupIncomplete";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await profileInfo();

  if (!profile) {
    redirect("/");
  }

  const isSendRequest = profile.shopSetupRequest !== null;
  const isRequestApproved = profile.shopSetupRequest?.status === "approved";

  const status = isRequestApproved ? await onboardingStatus() : null;


  return (
    <SidebarProvider>
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center">
            Loading Layout...
          </div>
        }
      >
        <DashboardLayoutContent>
          {isSendRequest ? (
            isRequestApproved ? (
              status ? (
                children
              ) : (
                <Onboarding />
              )
            ) : (
              <ShopPendingPage />
            )
          ) : (
            <ShopSetupIncompletePage />
          )}
        </DashboardLayoutContent>
      </Suspense>
    </SidebarProvider>
  );
}


// logic isSendRequest? 