"use client";

import { CommonPagination } from "@/components/commonPagination";
import { useRouter, usePathname, useSearchParams } from "next/navigation";


interface Props {
  currentPage: number;
  totalPages: number;
}

export function JournalPaginationWrapper({ currentPage, totalPages }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    
    router.push(`${pathname}?${params.toString()}`, { scroll: true });
  };

  return (
    <CommonPagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
    />
  );
}