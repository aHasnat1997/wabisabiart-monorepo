"use client"

import Authenticity from "./components/Authenticity";
import GettingSettings from "./components/GettingSettings";
import Security from "./components/Security";
import BellingAndFess from "./components/BillingAndFess";
import {
  Tabs,
  TabsPanel,
  TabsPanels,
  TabsList,
  TabsTab,
} from "@/components/animate-ui/components/base/tabstabs";
import SectionTitle from "@/components/SectionTitle";
import ShopSettings from "./components/ShopSettings";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { profileInfo } from "@/lib/auth-server";
import { User } from "@/types/auth";
import { getSellerDetails } from "@/app/(root)/components/action";
import { Shop } from "@/types/seller-profile";

const VALID_TABS = [
  "general",
  "shop",
  "authenticity",
  "security",
  "belling",
] as const;
type TabValue = (typeof VALID_TABS)[number];

const Settings = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read tab from URL; fall back to "general" if missing or invalid
  const tabParam = searchParams.get("tab") as TabValue | null;
  const activeTab: TabValue =
    tabParam && VALID_TABS.includes(tabParam) ? tabParam : "general";

  const [profileData, setProfileData] = useState<User | null>(null);
  const [shopInofo, setShopInfo] = useState<Shop | null>(null);

  useEffect(() => {
    const fetchProfileInfo = async () => {
      try {
        const res = await profileInfo();
        setProfileData(res);
      } catch (error) {
        console.error("Error fetching profile info:", error);
      }
    };
    fetchProfileInfo();
  }, []);

  // Added [profileData] dep so this runs only when profileData changes,
  // not on every render (was missing dep array before)
  useEffect(() => {
    if (profileData?.role !== "seller") return;
    const fetchSellerDetails = async () => {
      try {
        const res = await getSellerDetails(
          profileData?.sellerProfile?.id || "",
        );
        setShopInfo(res);
      } catch (error) {
        console.error("Error fetching seller details:", error);
      }
    };
    fetchSellerDetails();
  }, [profileData]);

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    // replace so the back button doesn't cycle through tab history
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div>
      <div className="">
        <SectionTitle
          title="Settings"
          subtitle="Manage your account, store, and preferences"
        />
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList
          className="flex sticky border-b bg-background! py-1.5 top-0 z-30 rounded-none responsive-tabs gap-4 md:gap-8 lg:gap-15 xl:gap-24"
          highlightClassName="bg-background text-primary border-primary"
        >
          <TabsTab value="general">General</TabsTab>
          <TabsTab value="shop">Shop</TabsTab>
          <TabsTab value="authenticity">Authenticity</TabsTab>
          <TabsTab value="security">Security</TabsTab>
          <TabsTab value="belling">Billing & Fees</TabsTab>
        </TabsList>

        <TabsPanels className="py-6">
          <TabsPanel value="general">
            <GettingSettings profileData={profileData as User} />
          </TabsPanel>
          <TabsPanel value="shop">
            <ShopSettings shopInofo={shopInofo} />
          </TabsPanel>
          <TabsPanel value="authenticity">
            <Authenticity />
          </TabsPanel>
          <TabsPanel value="security">
            <Security />
          </TabsPanel>
          <TabsPanel value="belling">
            <BellingAndFess />
          </TabsPanel>
        </TabsPanels>
      </Tabs>
    </div>
  );
};

export default Settings;