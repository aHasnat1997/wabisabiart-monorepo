import { Suspense } from "react";
import MyListing from "./components/MyListing";

const Products = ({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) => {
  return (
    <Suspense fallback={null}>
      <MyListing searchParams={searchParams} />
    </Suspense>
  );
};

export default Products;