"use client";

import { useState } from "react";
import {
  Star,
  MessageCircle,
  Info,
  FileText,
  Globe,
  MapPin,
  ExternalLink,
  Megaphone,
  Loader2,
} from "lucide-react";
import { Shop } from "@/types/seller-profile";
import Image from "next/image";
import { resolveImageUrl } from "@/lib/utils";
import ProductCard from "../../components/card";
import HtmlRenderer from "@/components/htmlRenderer";
import { useCreateConversation } from "@/hooks/usecreateconversation";

type PolicyKey = "return" | "shipping" | "privacy";

const POLICY_TABS: { key: PolicyKey; label: string }[] = [
  { key: "return", label: "Returns" },
  { key: "shipping", label: "Shipping" },
  { key: "privacy", label: "Privacy" },
];

export default function SellerProfileClient({
  sellerProfile,
}: {
  sellerProfile: Shop;
}) {
  const [activePolicy, setActivePolicy] = useState<PolicyKey>("return");
  const { createAndRedirect, loading } = useCreateConversation();

  const handleMessage = () => {
    createAndRedirect({
      receiverId: sellerProfile.id, // seller এর sellerProfile.id
      type: "general",
    });
  };

  const policyContent: Record<PolicyKey, string | null> = {
    return: sellerProfile.returnPolicy ?? null,
    shipping: sellerProfile.shippingPolicy ?? null,
    privacy: sellerProfile.privacyPolicy ?? null,
  };

  const joinYear = new Date(sellerProfile.createdAt).getFullYear();
  const avgRating = parseFloat(sellerProfile.averageRating);

  const socialLinks = [
    {
      href: sellerProfile.instagramUrl,
      label: "Instagram",
      handle:
        sellerProfile.instagramUrl?.replace(
          /^https?:\/\/(www\.)?instagram\.com\/?/,
          "@",
        ) ?? "",
      iconColor: "oklch(0.55 0.18 330)",
      bgColor: "oklch(0.96 0.02 330)",
    },
    {
      href: sellerProfile.facebookUrl,
      label: "Facebook",
      handle:
        sellerProfile.facebookUrl?.replace(
          /^https?:\/\/(www\.)?facebook\.com\/?/,
          "",
        ) ?? "",
      iconColor: "oklch(0.48 0.14 250)",
      bgColor: "oklch(0.95 0.03 250)",
    },
    {
      href: sellerProfile.twitterUrl,
      label: "Twitter / X",
      handle:
        sellerProfile.twitterUrl?.replace(
          /^https?:\/\/(www\.)?(twitter|x)\.com\/?/,
          "@",
        ) ?? "",
      iconColor: "oklch(0.20 0.02 250)",
      bgColor: "oklch(0.95 0.01 250)",
    },
    {
      href: sellerProfile.websiteUrl,
      label: "Website",
      handle: sellerProfile.websiteUrl?.replace(/^https?:\/\//, "") ?? "",
      iconColor: "oklch(0.45 0.12 145)",
      bgColor: "oklch(0.95 0.04 145)",
    },
  ].filter((s) => s.href);

  const shopInitials = sellerProfile.shopName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="x-auto px-3 sm:px-4 py-6">
      {/* ── Banner ── */}
      <div className="relative">
        <div className="relative w-full h-40 sm:h-48 md:h-52 rounded-xl overflow-hidden bg-primary">
          {sellerProfile.shopBannerImage ? (
            <Image
              src={resolveImageUrl(sellerProfile.shopBannerImage)}
              alt={`${sellerProfile.shopName} banner`}
              className="absolute inset-0 w-full h-full object-cover"
              width={800}
              height={400}
            />
          ) : (
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)",
                backgroundSize: "20px 20px",
              }}
            />
          )}
          <div className="absolute inset-0 bg-linear-to-b from-transparent to-black/40" />
          <p className="absolute bottom-2 left-4 text-white/70 text-[11px]">
            Since {joinYear}
          </p>
        </div>

        <div
          className="absolute left-1 z-20 rounded-full border-4 border-background shadow-lg overflow-hidden flex items-center justify-center"
          style={{
            width: 100,
            height: 100,
            bottom: -75,
            background: "oklch(0.94 0.05 145)",
          }}
        >
          {sellerProfile.shopLogo ? (
            <Image
              width={200}
              height={200}
              src={resolveImageUrl(sellerProfile.shopLogo)}
              alt={sellerProfile.shopName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span
              className="text-3xl font-semibold"
              style={{ color: "oklch(0.35 0.1 145)" }}
            >
              {shopInitials}
            </span>
          )}
        </div>
      </div>

      {/* Name + actions row */}
      <div className="flex items-center gap-3 mt-2 px-2">
        <div style={{ width: 88, flexShrink: 0 }} />

        <div className="flex flex-col md:flex-row justify-between md:items-center flex-1 gap-1">
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-xl font-bold text-foreground leading-tight">
              {sellerProfile.shopName}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              <span>
                {sellerProfile.followers.length.toLocaleString()} followers
              </span>
              <span className="mx-1.5">·</span>
              <span>{sellerProfile.user.fullName}</span>
            </p>
          </div>

          {/* ✅ Message Button */}
          <div className="shrink-0">
            <button
              onClick={handleMessage}
              disabled={loading}
              className="inline-flex items-center gap-1.5 h-9 px-4 cursor-pointer hover:scale-102 hover:shadow rounded-full text-xs font-medium border border-border bg-card text-foreground hover:opacity-85 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <MessageCircle className="w-3.5 h-3.5" />
              )}
              {loading ? "Opening..." : "Message"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        {[
          {
            label: "Total Sales",
            value: sellerProfile.totalSales.toLocaleString(),
            sub: "orders fulfilled",
          },
          {
            label: "Rating",
            value: isNaN(avgRating) ? "—" : avgRating.toFixed(1),
            sub: `from ${sellerProfile.totalReviews} reviews`,
            star: !isNaN(avgRating),
          },
          {
            label: "Followers",
            value: sellerProfile.followers.length.toLocaleString(),
            sub: "shop followers",
          },
          {
            label: "Products",
            value: sellerProfile.products.length.toLocaleString(),
            sub: "active listings",
          },
        ].map((s) => (
          <div key={s.label} className="bg-muted rounded-lg p-3 sm:p-4">
            <p className="text-[11px] text-muted-foreground mb-1">{s.label}</p>
            <p className="text-xl font-bold text-foreground mb-0.5 flex items-center gap-1">
              {s.value}
              {s.star && <Star className="w-4 h-4 fill-chart-3 text-chart-3" />}
            </p>
            <p className="text-[11px] text-muted-foreground/70">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Content grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-4 items-start mt-6">
        <div className="space-y-4">
          {/* About */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 p-3 border-b border-border">
              <Info className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-[13px] font-semibold text-foreground">
                About the shop
              </h2>
            </div>
            <div className="p-4 space-y-3">
              {sellerProfile.shopDescription.split("\n\n").map((para, i) => (
                <p
                  key={i}
                  className="text-[13px] text-muted-foreground leading-relaxed"
                >
                  {para}
                </p>
              ))}

              {sellerProfile.shopAnnouncement && (
                <div
                  className="rounded-md p-3"
                  style={{
                    background: "oklch(0.97 0.05 75)",
                    border: "1px solid oklch(0.85 0.1 75)",
                  }}
                >
                  <p
                    className="flex items-center gap-1.5 text-[11px] font-bold mb-1"
                    style={{ color: "oklch(0.40 0.13 75)" }}
                  >
                    <Megaphone className="w-3 h-3" /> Shop announcement
                  </p>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "oklch(0.35 0.1 75)" }}
                  >
                    {sellerProfile.shopAnnouncement}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Policies */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 p-3 border-b border-border">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-[13px] font-semibold text-foreground">
                Shop policies
              </h2>
            </div>
            <div className="p-4">
              <div className="flex gap-2 flex-wrap mb-3">
                {POLICY_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActivePolicy(tab.key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer transition ${
                      activePolicy === tab.key
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "bg-muted border-border text-muted-foreground"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {policyContent[activePolicy] ? (
                <HtmlRenderer html={policyContent[activePolicy]!} />
              ) : (
                <p className="text-[13px] text-muted-foreground">
                  No policy provided.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4 sticky top-4">
          {socialLinks.length > 0 && (
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="flex items-center gap-2 p-3 border-b border-border">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-[13px] font-semibold text-foreground">
                  Connect
                </h2>
              </div>
              <div className="p-4 space-y-2.5">
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2.5 rounded-md bg-muted hover:bg-primary/10 transition-colors"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: link.bgColor }}
                    >
                      <Globe
                        className="w-4 h-4"
                        style={{ color: link.iconColor }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-foreground mb-0.5">
                        {link.label}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {link.handle}
                      </p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {sellerProfile.address && (
            <div className="flex items-center text-lg gap-2">
              <MapPin className="size-5 text-muted-foreground" />
              <h2 className="font-semibold capitalize text-foreground">
                {sellerProfile.address}
              </h2>
            </div>
          )}
        </div>
      </div>

      {/* ── Products ── */}
      {sellerProfile.products.length > 0 && (
        <>
          <div className="flex items-center justify-between flex-wrap gap-2 mt-4">
            <h2 className="text-[15px] font-bold text-foreground mb-2">
              Products
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-6 mb-8">
            {sellerProfile.products.map((product) => (
              <ProductCard product={product} key={product.id} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}