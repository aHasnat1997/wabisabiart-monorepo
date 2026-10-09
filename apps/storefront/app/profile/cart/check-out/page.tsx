import CheckoutSummary from "../component/checkoutSummery";
import SectionTitle from "@/components/SectionTitle";
import CheckoutClient from "./components/CheckoutClient";
import { getCartCalculation, getDefaultAddress } from "../component/actions";
import { CartCalculation } from "@/types/order";
import { Address } from "@/types/address";

export default async function CheckOutPage() {
  let cartCalculation: CartCalculation | null = null;
  let defaultAddress: Address | null = null;
  try {
    cartCalculation = await getCartCalculation();
    defaultAddress = await getDefaultAddress();
  } catch (error) {
    console.error(error);
  }
  return (
    <div className="min-h-screen">
      <SectionTitle title="Checkout" />
      <div className="flex flex-col-reverse md:flex-row gap-12 md:gap-2 xl:gap-4 items-start">
        <CheckoutClient defaultAddress={defaultAddress} />
        <CheckoutSummary
          mode="checkout"
          shippingAddressId={defaultAddress?.id}
          cartCalculation={cartCalculation}
        />
      </div>
    </div>
  );
}
