import SideBar from "./components/SideBar";
import CollectionHeader from "./components/CollectionHeader";
import FavCard from "./components/favCard";
import {
  getCategories,
  getCollections,
  getWishlistProducts,
} from "./components/action";
import { Heart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import SectionTitle from "@/components/SectionTitle";

interface FavouriteListPageProps {
  searchParams: Promise<{
    "filter[categoryId]"?: string;
    id?: string;
  }>;
}

export default async function FavouriteListPage({
  searchParams,
}: FavouriteListPageProps) {
  const resolvedParams = await searchParams;

  const queryParts: string[] = [];
  if (resolvedParams["filter[categoryId]"])
    queryParts.push(
      `filter[categoryId]=${resolvedParams["filter[categoryId]"]}`,
    );
  if (resolvedParams["id"]) queryParts.push(`id=${resolvedParams["id"]}`);
  const queryString = queryParts.join("&");

  const wishlistProducts = await getWishlistProducts(queryString);
  const categories = await getCategories();
  const collections = await getCollections();

  // Get active category or collection name
  let headerTitle = "All Items";
  let isCollectionView = false;
  let headerIsPrivate = false;
  const activeCategoryId = resolvedParams["filter[categoryId]"];
  const activeCollectionId = resolvedParams["id"];

  if (activeCategoryId && categories) {
    const activeCategory = categories.find(
      (cat) => cat.id === activeCategoryId,
    );
    if (activeCategory) {
      headerTitle = activeCategory.name;
      headerIsPrivate = activeCategory.isPrivate ?? false;
    }
  } else if (activeCollectionId && collections) {
    const activeCollection = collections.find(
      (col) => col.id === activeCollectionId,
    );
    if (activeCollection) {
      headerTitle = activeCollection.name;
      headerIsPrivate = !activeCollection.isPublic;
      isCollectionView = true;
    }
  }

  return (
    <div className="min-h-screen">
      <SectionTitle title="My Wishlist" />

      <section className="flex gap-4">
        <aside className="hidden md:block w-52">
          <SideBar categories={categories} collections={collections} />
        </aside>

        <div className="flex-1">
          <CollectionHeader
            title={headerTitle}
            itemCount={wishlistProducts?.data?.length}
            isPrivate={headerIsPrivate}
            isCollection={isCollectionView}
            collectionId={activeCollectionId}
            categories={categories}
            collections={collections}
          />

          <div className="grid grid-cols-1 min-[425px]:grid-cols-2 xl:grid-cols-3 gap-2 lg:gap-6">
            {wishlistProducts?.data?.length ? (
              wishlistProducts.data.map((product) => (
                <FavCard
                  collections={collections}
                  key={product.id}
                  product={product}
                />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-center gap-4">
                <Heart
                  className="size-16 text-muted-foreground/30"
                  strokeWidth={1.5}
                />
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    No favourites yet
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Items you heart will show up here.
                  </p>
                </div>
                <Link href="/products">
                  <Button variant="outline" className="rounded-full mt-2">
                    Browse products
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
