
import { Card } from '@/components/ui/card';
import { ApiCouponResponse, Coupon, CustomerType } from '@/types/sellerDashboard/CouponsItems';

import { CouponsCard } from './components/CouponsCard';

export const dynamic = "force-dynamic";

import CouponTop from './components/CouponTop';
import { Suspense } from 'react';
import { getCoupons, getCouponsStats } from './components/CouponsAction';


// export const couponsData : Coupon[] = [
//   {
//     id: 1,
//     title: "WELCOME10",
//     customerType: "New Customer",
//     value: "10% off",
//     minPurchase: "$1000",
//     expiresDate: "31 January 2026",
//     status: "active",
//     expiresAt: "2026-01-31",
//     createdAt: "2026-01-01"
//   },
//   {
//     id: 2,
//     title: "NEWBIE5",
//     customerType: "Returning Customer",
//     value: "5% off",
//     minPurchase: "$500",
//     expiresDate: "28 February 2026",
//     status: "active",
//     expiresAt: "2026-02-28",
//     createdAt: "2026-01-10"
//   },
//   {
//     id: 3,
//     title: "ALL10",
//     customerType: "All Customer",
//     value: "10% off",
//     minPurchase: "$1000",
//     expiresDate: "31 March 2026",
//     status: "active",
//     expiresAt: "2026-03-31",
//     createdAt: "2026-01-15"
//   },
//   {
//     id: 4,
//     title: "VIP50",
//     customerType: "VIP Only",
//     value: "50% off",
//     minPurchase: "$5000",
//     expiresDate: "30 April 2026",
//     status: "active",
//     expiresAt: "2026-04-30",
//     createdAt: "2026-01-20"
//   }
// ];



const Coupons = async() => {

  const rawApiData = await getCoupons();
  const couponStats =  await getCouponsStats();
  console.log("Coupon stats: ", couponStats)

  // console.log("coupon card: ",rawApiData);

const couponsData: Coupon[] = rawApiData.map((apiItem: ApiCouponResponse) => {
    
    
    const customerMap: Record<string, CustomerType> = {
      "ALL_CUSTOMERS": "All Customer",
      "NEW_CUSTOMERS": "New Customer",
      "VIP_CUSTOMERS": "VIP Only",
      "RETURNING_CUSTOMERS": "Returning Customer"
    };

    
    let displayValue = "";
    if (apiItem.discountType === "PERCENTAGE") displayValue = `${apiItem.discountValue}% off`;
    else if (apiItem.discountType === "FIXED") displayValue = `$${apiItem.discountValue} off`;
    else if (apiItem.discountType === "FREE_SHIPPING") displayValue = "Free Shipping";

   
    const formattedExpiresDate = new Date(apiItem.expiresAt).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'long', year: 'numeric'
    });

    return {
      id: apiItem.id,
      title: apiItem.code,
      customerType: customerMap[apiItem.customerRestriction] || "All Customer",
      value: displayValue,
      minPurchase: `$${apiItem.minimumPurchaseAmount || "0"}`,
      expiresDate: formattedExpiresDate,
      status: apiItem.isActive ? "active" : "inactive",
      expiresAt: apiItem.expiresAt,
      createdAt: apiItem.createdAt,
      usedCount: apiItem.usedCount || 0,
      maxUses: apiItem.maximumUses || 100,
    };
  });

  
  return (
   <Suspense fallback={<div>Loading Coupons...</div>}>
      <div>
        <Card className="md:p-6 p-4">
          <CouponTop stats={couponStats} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {couponsData.length > 0 ? (
              couponsData.map((coupon) => (
                <CouponsCard key={coupon.id} coupon={coupon} />
              ))
            ) : (
              <p className="text-muted-foreground mt-4">No coupons found.</p>
            )}
          </div>
        </Card>
      </div>
    </Suspense>
  )
}

export default Coupons;