import { getBestDeals } from "../components/action";
import { TodaysDealsClient } from "../components/Todaysdealsclient";

// Server Component — initial data fetch এখানে
export default async function TodaysDealsPage() {
  const initialData = await getBestDeals("page=1&limit=12").catch(() => null);

  return (
    <TodaysDealsClient
      initialData={initialData}
      initialTotalPages={initialData?.meta?.totalPages ?? 1}
    />
  );
}
