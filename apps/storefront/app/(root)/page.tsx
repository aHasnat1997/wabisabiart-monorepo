export const dynamic = "force-dynamic";

import {
  getBestDeals,
  getFeaturedCategories,
  getFeaturedStory,
  getGiftCategories,
} from "./components/action";
import Banner from "./components/banner";
import CharacterCostumes from "./components/characterCostumes";
import Deals from "./components/deals";
import FeaturedCategory from "./components/featuredCategory";
import FeaturedStory from "./components/featuredStory";
import Gifts from "./components/gifts";
import Journal from "./components/journal";

export default async function Home() {
  const featured = await getFeaturedCategories();
  const dealsData = await getBestDeals();
  const featuredStory = await getFeaturedStory();
  const giftCategories = await getGiftCategories();

  return (
    <main>
      <Banner />
      <FeaturedCategory featured={featured} />
      <Deals dealsData={dealsData?.data} />
      <FeaturedStory featuredStory={featuredStory} />
      {featured?.map((item) => (
        <CharacterCostumes key={item.id} featured={item} />
      ))}
      <Gifts giftCategories={giftCategories} />
      <Journal />
    </main>
  );
}
