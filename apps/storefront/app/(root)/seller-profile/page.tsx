import React from "react";
import SellerProfileClient from "./_component/SellerProfileClient";
import { getSellerDetails } from "../components/action";

export default async function SellerProfile({
  searchParams,
}: {
  searchParams: Promise<{ sellerId?: string }>;
}) {
  const { sellerId } = await searchParams;

  if (!sellerId) {
    return <div>Seller ID is required</div>;
  }

  const sellerProfile = await getSellerDetails(sellerId);

  return <SellerProfileClient sellerProfile={sellerProfile} />;
}
