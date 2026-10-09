"use client";

import React, { useEffect } from "react";
import { TbLayoutGridFilled } from "react-icons/tb";
import {
  Menu,
  MenuGroup,
  MenuItem,
  MenuPanel,
  MenuTrigger,
} from "./animate-ui/components/base/menuCategroy";
import { cn } from "@/lib/utils";
import { ArrowLeft, ChevronDown, ChevronRight } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import Image from "next/image";
import Link from "next/link";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./animate-ui/components/radix/dialog";
import NoImg from "@/assets/images/noImg.png";
import { Category, CategoryDetails } from "@/types/category";
import { getAllCategories, getCategoryDetails } from "./actions";

export default function CategoryPanel() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [hoveredCategory, setHoveredCategory] = React.useState<Category | null>(
    null,
  );
  const [categoryDetails, setCategoryDetails] =
    React.useState<CategoryDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [mobileDialogOpen, setMobileDialogOpen] = React.useState(false);

  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllCategories();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!hoveredCategory) {
      setCategoryDetails(null);
      return;
    }
    let cancelled = false;
    const fetchDetails = async () => {
      setLoadingDetails(true);
      try {
        const data = await getCategoryDetails(hoveredCategory.id);
        if (!cancelled) setCategoryDetails(data);
      } catch (error) {
        console.error("Error fetching category details:", error);
      } finally {
        if (!cancelled) setLoadingDetails(false);
      }
    };
    fetchDetails();
    return () => {
      cancelled = true;
    };
  }, [hoveredCategory]);

  const handleCategoryClick = () => {
    setIsOpen(false);
    setHoveredCategory(null);
    setCategoryDetails(null);
    setMobileDialogOpen(false);
  };

  const handleMobileCategoryClick = (category: Category) => {
    setHoveredCategory(category);
    setMobileDialogOpen(true);
  };

  const handleModalBack = () => {
    setMobileDialogOpen(false);
    setIsOpen(true);
  };

  const subCategories = categoryDetails?.subCategories ?? [];

  return (
    <>
      <Menu open={isOpen} onOpenChange={setIsOpen}>
        <MenuTrigger
          render={
            <button className="flex items-center gap-1.5 hover:text-primary cursor-pointer font-medium">
              <TbLayoutGridFilled size={24} /> Category <ChevronDown />
            </button>
          }
        />
        <MenuPanel
          className="w-full max-w-full shadow-2xl px-0 flex"
          align="start"
          onMouseLeave={() => !isMobile && setHoveredCategory(null)}
        >
          {/* Left Sidebar */}
          <div className="shrink-0">
            <ScrollArea className="h-[85vh]">
              <MenuGroup className="py-5 w-76 md:w-96 border-r grid grid-cols-1 gap-2">
                {categories.map((item) => (
                  <MenuItem
                    key={item.id}
                    className="text-base md:text-lg font-medium flex items-center justify-between px-5 cursor-pointer"
                    onMouseEnter={() => !isMobile && setHoveredCategory(item)}
                    onClick={() => isMobile && handleMobileCategoryClick(item)}
                  >
                    <span>{item.name}</span>
                    <ChevronRight
                      className={cn(
                        "transition-transform duration-200 ease-in-out",
                        !isMobile && hoveredCategory?.id === item.id
                          ? "rotate-90"
                          : "",
                      )}
                    />
                  </MenuItem>
                ))}
              </MenuGroup>
            </ScrollArea>
          </div>

          {/* Right Content Panel - Desktop only */}
          {!isMobile && hoveredCategory && (
            <ScrollArea className="h-[85vh] w-full">
              <div className="flex-1 max-w-264 p-6">
                <h3 className="text-2xl font-bold mb-4">
                  {hoveredCategory.name}
                </h3>

                {loadingDetails ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-64 rounded-lg bg-muted animate-pulse"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {subCategories.map((item) => (
                      <Link
                        key={item.id}
                        href={`/products?filter[category]=${hoveredCategory?.name}&filter[subCategory]=${item.name}`}
                        onClick={handleCategoryClick}
                      >
                        <div className="relative h-64 group overflow-hidden rounded-lg hover:shadow-xl duration-300 cursor-pointer transition-transform">
                          <Image
                            className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                            src={
                              `${process.env.NEXT_PUBLIC_MEDIA_URL}${item.imageUrl}` ||
                              NoImg
                            }
                            alt={item.name}
                            width={250}
                            height={250}
                          />
                          {/* Gradient overlay */}
                          <div className="absolute inset-0 bg-linear-to-t from-foreground/70 via-foreground/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
                          {/* Label */}
                          <div className="absolute inset-0 flex items-end justify-center pb-6">
                            <p className="mx-4  text-lg font-medium text-card px-3 py-1.5 rounded-lg backdrop-blur-sm bg-card/10 border border-card/20 shadow-lg line-clamp-2 transform transition-all duration-300 group-hover:bg-card/20">
                              {item.name}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </MenuPanel>
      </Menu>

      {/* Mobile Dialog */}
      <Dialog open={mobileDialogOpen} onOpenChange={setMobileDialogOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="text-xl font-semibold flex items-center gap-1">
              <button
                onClick={handleModalBack}
                className="hover:text-destructive cursor-pointer"
              >
                <ArrowLeft size={18} />
              </button>
              {hoveredCategory?.name}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[calc(90vh-120px)] px-3 pb-4">
            {loadingDetails ? (
              <div className="grid grid-cols-2 gap-3 py-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-36 rounded-lg bg-muted animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 py-2">
                {subCategories.map((item) => (
                  <Link
                    key={item.id}
                    href={`/products?filter[category]=${hoveredCategory?.name}&filter[subCategory]=${item.name}`}
                    onClick={handleCategoryClick}
                  >
                    <div className="relative h-36 group overflow-hidden rounded-lg hover:shadow-lg duration-300 cursor-pointer transition-transform">
                      <Image
                        className="w-full h-36 object-cover transition-transform duration-500 group-hover:scale-105"
                        src={
                          `${process.env.NEXT_PUBLIC_MEDIA_URL}${item.imageUrl}` ||
                          NoImg
                        }
                        alt={item.name}
                        width={200}
                        height={200}
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-linear-to-t from-foreground/70 via-foreground/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
                      {/* Label */}
                      <div className="absolute inset-0 flex items-end justify-center pb-4">
                        <p className="mx-2  text-xs line-clamp-2 text-card px-2 py-1 rounded-md backdrop-blur-sm bg-card/10 border border-card/20 shadow-lg">
                          {item.name}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
