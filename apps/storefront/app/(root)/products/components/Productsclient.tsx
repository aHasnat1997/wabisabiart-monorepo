"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SortIcon from "@/assets/icons/sort.svg";
import { ArrowUp, ArrowDown, PackageSearch } from "lucide-react";
import { CommonPagination } from "@/components/commonPagination";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ProductsResponse } from "@/types/product";
import { getAllProduct } from "../../components/action";
import ProductCard from "../../components/card";

interface Filters {
  subCategory: string | null;
  category: string | null;
  type: string | null;
  sort: string | null;
  order: string | null;
}

interface Props {
  initialData: ProductsResponse | null;
  initialTotalPages: number;
  initialFilters: Filters;
}

const formatText = (text?: string | null) =>
  text
    ? decodeURIComponent(text)
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : null;

function ProductSkeleton() {
  return <div className="rounded-xl h-52 lg:h-75 bg-muted animate-pulse" />;
}

function EmptyFallback({ title }: { title: string }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
        <PackageSearch className="h-10 w-10 text-muted-foreground" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          No products found
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          We couldn&apos;t find any {title.toLowerCase()} products right now.
          Try adjusting your filters or check back later.
        </p>
      </div>
    </div>
  );
}

export function ProductsClient({
  initialData,
  initialTotalPages,
  initialFilters,
}: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ProductsResponse | null>(
    initialData,
  );

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Always read latest filters from URL
  const subCategory =
    searchParams.get("filter[subCategory]") ?? initialFilters.subCategory;
  const category =
    searchParams.get("filter[category]") ?? initialFilters.category;
  const type = searchParams.get("filter[categoryType]") ?? initialFilters.type;
  const sort = searchParams.get("sort") ?? initialFilters.sort;
  const order = searchParams.get("order") ?? initialFilters.order;

  const title =
    formatText(subCategory) ||
    formatText(category) ||
    formatText(type) ||
    "All";

  const handleSort = (value: "asc" | "desc") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", "price");
    params.set("order", value);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
    setCurrentPage(1);
  };

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", String(currentPage));
    params.set("limit", "12");
    if (subCategory) params.set("filter[subCategory]", subCategory);
    else if (category) params.set("filter[category]", category);
    else if (type) params.set("filter[categoryType]", type);
    if (sort) params.set("sort", sort);
    if (order) params.set("order", order);
    return params.toString();
  }, [currentPage, subCategory, category, type, sort, order]);

  // Skip page 1 — server already fetched it
  // Re-fetch when page changes or sort/filter changes (except initial render)
  const [isFirstRender, setIsFirstRender] = useState(true);

  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await getAllProduct(buildQuery());
        setProducts(data);
        setTotalPages(data.meta.totalPages);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setProducts(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [buildQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="flex flex-col md:flex-row items-start gap-2 md:items-center justify-between mb-7">
        <h2 className="text-xl md:text-3xl lg:text-4xl font-semibold sm:font-bold text-foreground">
          {title} Products
        </h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full cursor-pointer hover:bg-primary hover:text-card flex items-center gap-2 text-sm border border-input px-3 font-medium bg-background py-1">
              {sort === "price" && order === "asc" ? (
                <>
                  Price: Low to High <ArrowUp className="w-4 h-4" />
                </>
              ) : sort === "price" && order === "desc" ? (
                <>
                  Price: High to Low <ArrowDown className="w-4 h-4" />
                </>
              ) : (
                <>
                  Sort by <SortIcon />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>Sort by Price</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleSort("asc")}
              className={
                sort === "price" && order === "asc" ? "text-primary" : ""
              }
            >
              <ArrowUp className="w-4 h-4" /> Price: Low to High
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleSort("desc")}
              className={
                sort === "price" && order === "desc" ? "text-primary" : ""
              }
            >
              <ArrowDown className="w-4 h-4" /> Price: High to Low
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </section>

      {/* Product Grid */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-6 mb-8">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
        ) : products?.data && products.data.length > 0 ? (
          products.data.map((product) => (
            <ProductCard product={product} key={product.id} />
          ))
        ) : (
          <EmptyFallback title={title} />
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
