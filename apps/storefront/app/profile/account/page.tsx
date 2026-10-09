"use client";

import {
  Tabs,
  TabsPanel,
  TabsPanels,
  TabsList,
  TabsTab,
} from "@/components/animate-ui/components/base/tabstabs";
import Account from "./components/Account";
import Security from "./components/Security";
import Addresses from "./components/Addresses";
import CreditCards from "./components/CreditCards";
import Notification from "./components/Notification";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const TABS = [
  "account",
  "security",
  "public-profile",
  "privacy",
  "addresses",
  "cards",
  "notification",
];

function AccountPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromParams = searchParams.get("tab");
  const activeTab =
    tabFromParams && TABS.includes(tabFromParams) ? tabFromParams : "account";

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`?${params.toString()}`);
  };

  return (
    <div>
      <h2 className="text-3xl md:text-[32px] text-foreground font-semibold mb-6">
        Account Settings
      </h2>
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <div className="border-b bg-card! sticky top-0 z-30 ">
          <TabsList className="flex  py-1.5 rounded-none  gap-4 md:gap-8 lg:gap-15 xl:gap-24 responsive-tabs">
            <TabsTab value="account">Account</TabsTab>
            <TabsTab value="security">Security</TabsTab>
            {/* <TabsTab value="privacy">Privacy</TabsTab> */}
            <TabsTab value="addresses">Addresses</TabsTab>
            <TabsTab value="cards">Credit Cards</TabsTab>
            <TabsTab value="notification">Notification</TabsTab>
          </TabsList>
        </div>

        <TabsPanels className="py-6">
          <TabsPanel value="account">
            <Account />
          </TabsPanel>
          <TabsPanel value="security">
            <Security />
          </TabsPanel>
          {/* <TabsPanel value="privacy">
            <Privacy />
          </TabsPanel> */}
          <TabsPanel value="addresses">
            <Addresses />
          </TabsPanel>
          <TabsPanel value="cards">
            <CreditCards />
          </TabsPanel>
          <TabsPanel value="notification">
            <Notification />
          </TabsPanel>
        </TabsPanels>
      </Tabs>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
      <AccountPageContent />
    </Suspense>
  );
}