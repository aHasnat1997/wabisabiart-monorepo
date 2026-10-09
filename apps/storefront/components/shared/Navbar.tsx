import Image from "next/image";
import logImg from "@/assets/images/Logo.png";
import { Gift, Store } from "lucide-react";
import Link from "next/link";
import CategoryPanel from "../categoryPanel";
import { isUser, profileInfo } from "@/lib/auth-server";
import NavClient from "./NavbarClient";

export default async function Navbar() {
  // Both calls run in parallel on the server — no client-side waterfalls
  const authenticated = await isUser();
  const profileData = authenticated
    ? await profileInfo().catch(() => undefined)
    : undefined;

  return (
    <nav className="py-4 section-container px-2 border-b mb-6">
      <section>
        <NavClient
          authenticated={authenticated}
          profileData={profileData}
          logo={
            <Link href="/">
              <Image
                className="w-10 md:w-12 h-auto"
                src={logImg}
                alt="logo"
                height={50}
                width={50}
              />
            </Link>
          }
        />
      </section>

      {/* ── Bottom row — 100% static, zero client JS ─────────────── */}
      <section className="flex items-center justify-between pt-5">
        <div className="flex gap-6 items-center">
          <div className="flex-1 w-full">
            <CategoryPanel />
          </div>
          <p>|</p>
          <Link
            className="font-medium hover:text-primary hidden md:block"
            href="/products?filter[categoryType]=crafts"
          >
            Crafts
          </Link>
          <Link
            className="font-medium hover:text-primary hidden md:block"
            href="/products?filter[categoryType]=customization"
          >
            Customization
          </Link>
          <Link
            className="font-medium hover:text-primary hidden md:block"
            href="/products?filter[categoryType]=commissions"
          >
            Commissions
          </Link>
          <Link
            className="font-medium hover:text-primary hidden md:block"
            href="/products?filter[categoryType]=vintage"
          >
            Vintage
          </Link>
        </div>
        <Link
          className="flex items-center gap-2 font-medium text-primary"
          href="/todays-deals"
        >
          <Store /> Shop Local
        </Link>
      </section>
    </nav>
  );
}
