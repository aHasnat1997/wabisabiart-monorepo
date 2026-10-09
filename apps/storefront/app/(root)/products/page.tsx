import { getAllProduct } from "../components/action";
import { ProductsClient } from "./components/Productsclient";

interface PageProps {
  searchParams: Promise<Record<string, string>>;
}

// Server Component — initial data fetch এখানে
export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const subCategory = params["filter[subCategory]"] ?? null;
  const category = params["filter[category]"] ?? null;
  const type = params["filter[categoryType]"] ?? null;
  const sort = params["sort"] ?? null;
  const order = params["order"] ?? null;

  // Initial query build (page 1)
  const query = new URLSearchParams();
  query.set("page", "1");
  query.set("limit", "12");
  if (subCategory) query.set("filter[subCategory]", subCategory);
  else if (category) query.set("filter[category]", category);
  else if (type) query.set("filter[categoryType]", type);
  if (sort) query.set("sort", sort);
  if (order) query.set("order", order);

  const initialData = await getAllProduct(query.toString()).catch(() => null);

  return (
    <ProductsClient
      initialData={initialData}
      initialTotalPages={initialData?.meta?.totalPages ?? 1}
      initialFilters={{ subCategory, category, type, sort, order }}
    />
  );
}
