"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2 } from "lucide-react";
import Image from "next/image";
import { useModal } from "@/components/modal/Modal";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { CommonPagination } from "@/components/commonPagination";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RawProduct } from "@/types/sellerDashboard/Products";
import { getImageUrl } from "./getImageUrl";


function getStatusVariant(status: string) {
  switch (status) {
    case "active":
      return "default";
    case "draft":
      return "secondary";
    default:
      return "destructive";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "active":
      return "Active";
    case "draft":
      return "Draft";
    case "pending_review":
      return "Pending Review";
    default:
      return status;
  }
}

export default function ListingTableClient({
  products,
  total,
  totalPages,
  currentPage,
}: {
  products: RawProduct[];
  total: number;
  totalPages: number;
  currentPage: number;
}) {
  const { open } = useModal();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();


  console.log(products, "all product");
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="md:p-6 p-4 max-w-full bg-card rounded-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
        <div>
          <h2 className="text-xl font-semibold">My Listings</h2>
          <span className="text-sm text-muted-foreground">
            {total} products
          </span>
        </div>
        <Button
          onClick={() => open("add-product-modal", "add-product")}
          className="ml-auto bg-primary/90 hover:bg-primary"
        >
          + Add Product
        </Button>
      </div>

      {/* Desktop / Tablet Table */}
      <ScrollArea className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead className="text-left">Product</TableHead>
              <TableHead className="text-left">Price</TableHead>
              <TableHead className="text-left">Discount</TableHead>
              <TableHead className="text-center">Variants</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Sold</TableHead>
              <TableHead className="text-right">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products && products.length > 0 ? (
              products?.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="flex items-center gap-3 py-3">
                    <Image
                      src={getImageUrl(product.variants?.[0]?.mediaUrl || "")}
                      alt={product.title}
                      width={48}
                      height={48}
                      className="rounded-lg object-cover shrink-0 w-12 h-12"
                    />
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-sm leading-tight">
                        {product.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {product.seller.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-left">
                    ${parseFloat(product.price).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-left">
                    $
                    {product.discountType === "percentage"
                      ? `${product.discountValue}%`
                      : `${product.discountValue}`}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="ml-auto">
                      {product.variants?.length ?? 0} variants
                    </Badge>
                  </TableCell>
                  <TableCell
                    className={`text-right ${
                      product.totalQuantity <= 5
                        ? "text-destructive font-semibold"
                        : ""
                    }`}
                  >
                    {product.totalQuantity}
                  </TableCell>
                  <TableCell className="text-right">
                    {product.salesCount}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={getStatusVariant(product.status)}>
                      {getStatusLabel(product.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <Link
                        href={`?product-details-modal=product-details&id=${product.id}`}
                      >
                        <Button variant="ghost" size="icon">
                          <Eye size={20} />
                        </Button>
                      </Link>
                      <Link
                        href={`?product-edit-modal=product-edit&id=${product.id}`}
                      >
                        <Button
                          className="hover:bg-primary/50"
                          variant="ghost"
                          size="icon"
                        >
                          <Edit size={20} />
                        </Button>
                      </Link>
                      <Link
                        href={`?product-delate-modal=product-delate&id=${product.id}&name=${encodeURIComponent(product.title)}`}
                      >
                        <Button
                          variant="ghost"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          size="icon"
                        >
                          <Trash2 size={20} />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10">
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {totalPages > 1 && (
          <div className="mt-6">
            <CommonPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </ScrollArea>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {products && products.length > 0 ? (
          products.map((product) => (
            <div
              key={product.id}
              className="border rounded-lg p-2 shadow-sm flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-3">
                <Image
                  src={getImageUrl(product.variants?.[0]?.mediaUrl || "")}
                  alt={product.title}
                  width={48}
                  height={48}
                  className="rounded object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{product.title}</h3>
                  <div className="text-sm text-muted-foreground">
                    ${parseFloat(product.price).toFixed(2)}
                  </div>
                </div>
                <Badge variant={getStatusVariant(product.status)}>
                  {getStatusLabel(product.status)}
                </Badge>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  Stock:{" "}
                  <span
                    className={
                      product.totalQuantity <= 5
                        ? "text-destructive font-semibold"
                        : ""
                    }
                  >
                    {product.totalQuantity}
                  </span>
                </span>
                <span>Sold: {product.salesCount}</span>
              </div>
              <div className="flex space-x-2">
                <Link
                  href={`?product-details-modal=product-details&id=${product.id}`}
                >
                  <Button variant="ghost" size="icon">
                    <Eye size={20} />
                  </Button>
                </Link>
                <Link
                  href={`?product-edit-modal=product-edit&id=${product.id}`}
                >
                  <Button variant="ghost" size="icon">
                    <Edit size={20} />
                  </Button>
                </Link>
                <Link
                  href={`?product-delate-modal=product-delate&id=${product.id}`}
                >
                  <Button variant="ghost" size="icon">
                    <Trash2 className="text-destructive" size={20} />
                  </Button>
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            No products found.
          </div>
        )}
        {products && totalPages > 1 && (
          <div className="mt-6">
            <CommonPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}


