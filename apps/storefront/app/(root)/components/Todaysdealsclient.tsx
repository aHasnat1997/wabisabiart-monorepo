"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SortIcon from "@/assets/icons/sort.svg";
import { CommonPagination } from "@/components/commonPagination";
import ProductCard from "../components/card";
import CountdownTimer from "../components/countdownTimer";
import { ProductsResponse } from "@/types/product";
import { getBestDeals } from "../components/action";

// const getFormattedDate = (date: Date) => {
//   const day = String(date.getDate()).padStart(2, "0");
//   const month = String(date.getMonth() + 1).padStart(2, "0");
//   const year = date.getFullYear();
//   return `${day}/${month}/${year}`;
// };

interface Props {
  initialData: ProductsResponse | null;
  initialTotalPages: number;
}

export function TodaysDealsClient({ initialData, initialTotalPages }: Props) {
  // const [dealEndDate] = useState(() =>
  //   getFormattedDate(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)),
  // );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [loading, setLoading] = useState(false); // false — server থেকে initial data আসছে
  const [products, setProducts] = useState<ProductsResponse | null>(
    initialData,
  );

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", String(currentPage));
    params.set("limit", "12");
    return params.toString();
  }, [currentPage]);

  // page 1 এ server data আছে, তাই skip করো
  useEffect(() => {
    if (currentPage === 1) return;

    const fetchDeals = async () => {
      setLoading(true);
      try {
        const data = await getBestDeals(buildQuery());
        setProducts(data);
        setTotalPages(data.meta.totalPages);
      } catch (error) {
        console.error("Failed to fetch best deals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, [currentPage, buildQuery]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen">
      <section className="mb-7 flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
        <div className="flex flex-col-reverse items-start gap-0 md:flex-row md:items-center md:gap-8">
          <h2 className="text-foreground text-2xl font-bold md:text-4xl lg:text-[40px]">
            Explore Local Stores
          </h2>
          {/* <CountdownTimer targetDate={dealEndDate} /> */}
        </div>

        <div className="flex w-full justify-end gap-4 md:w-auto">
          <Button className="rounded-full" variant="outline">
            On Sale
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="border-input bg-background hover:bg-primary hover:text-card flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium">
                Sort by <SortIcon />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </section>

      <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-xl bg-gray-100"
            />
          ))
        ) : products?.data && products.data.length > 0 ? (
          products.data.map((product) => (
            <ProductCard product={product} key={product.id} />
          ))
        ) : (
          <p className="col-span-full py-10 text-center text-gray-400">
            No deals available right now.
          </p>
        )}
      </section>

      {totalPages > 1 && (
        <CommonPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
