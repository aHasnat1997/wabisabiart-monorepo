
import { User } from "@/types/auth";
import Notification from './Notification';
import PaymentMethod from './PaymentMethod';
import ProfileInformationCard from './ProfileInformationCard';
import Shipping from "./Shipping";

const GettingSettings = ({ profileData }: { profileData: User }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      <ProfileInformationCard profileData={profileData} />
      <Shipping></Shipping>

      {/* <StoreSettings></StoreSettings> */}
      <Notification></Notification>
      <PaymentMethod></PaymentMethod>
      {/* <LanguageRegion></LanguageRegion> */}
    </div>
  );
};

export default GettingSettings;