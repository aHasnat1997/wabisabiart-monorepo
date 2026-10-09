"use client"
import { Button } from '@/components/animate-ui/components/buttons/button';
import { useModal } from '@/components/modal/Modal';
import { CouponStats } from '@/types/sellerDashboard/CouponsItems';



type CouponTopProps = {
  stats: CouponStats; 
};

const CouponTop = ({ stats }:CouponTopProps ) => {
    const {open} = useModal();
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
  {/* Left: Title */}
  <div>
    <h1 className="text-popover-foreground font-semibold text-base sm:text-lg">
      Coupon Management
    </h1>
    <p className="text-muted-foreground text-xs sm:text-sm">
      {stats?.activeCoupons || 0} active coupons • {stats?.totalRedemptions || 0} total redemptions
        </p>
      
    
  </div>

  {/* Right: Create Button */}

      <Button 
      onClick={()=> open("coupon-modal", "create-coupon") }
      className="bg-primary text-card w-full sm:w-auto">
        + Create Coupons
      </Button>
   
</div>
  )
}

export default CouponTop;