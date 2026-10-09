"use client";

import { Lock, Trash2 } from "lucide-react";
import { GoPencil } from "react-icons/go";
import { RxDividerVertical } from "react-icons/rx";
import MobileDrawer from "./MobileDrawer";
import Link from "next/link";
import { WishlistCategory, WishlistCollection } from "@/types/wishlist";
import { toast } from "sonner";
import { deleteCollection } from "./action";
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/animate-ui/primitives/base/alert-dialog";
import { useRouter } from "next/navigation";

interface CollectionHeaderProps {
  title: string;
  itemCount: number;
  isPrivate?: boolean;
  isCollection?: boolean;
  collectionId?: string;
  categories?: WishlistCategory[];
  collections?: WishlistCollection[];
}

export default function CollectionHeader({
  title,
  itemCount,
  isPrivate,
  isCollection = false,
  collectionId,
  categories,
  collections,
}: CollectionHeaderProps) {


  const router = useRouter();

  const handleDeleteCollection = async () => {
    console.log(collectionId);
    if (!collectionId) return;
    try {
      const res = await deleteCollection(collectionId);
      if (res.success) {
        router.push("/favourite-list");
        toast.success(res.message || "Collection deleted successfully");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    }
  };
  return (
    <section className="flex flex-col lg:flex-row items-start gap-3 lg:items-center justify-between mb-6">
      <div>
        <div className="flex items-center gap-2">
          <div className="md:hidden">
            <MobileDrawer categories={categories} collections={collections} />
          </div>
          <span className="flex items-center gap-4">
            <h4 className="font-medium text-xl md:text-2xl">{title}</h4>
            {isCollection && title !== "My Wishlist" && (
              <>
                <Link
                  href={`?update-fav-collection-modal=update-fav-collection&id=${collectionId}&name=${title}&isPublic=${isPrivate}`}
                >
                  <button className="cursor-pointer rounded-full hover:bg-foreground/10 p-2 hover:scale-105 duration-200 hover:text-foreground">
                    <GoPencil className="size-3.5 md:size-4" />
                  </button>
                </Link>

                <AlertDialog>
                  <AlertDialogTrigger className="cursor-pointer rounded-full hover:bg-destructive/10 p-2 hover:scale-105 duration-200 hover:text-destructive">
                    <Trash2 className="size-3.5 md:size-4" />
                  </AlertDialogTrigger>

                  <AlertDialogPortal>
                    <AlertDialogBackdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
                    <AlertDialogPopup
                      className="sm:max-w-md fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] z-50 
                 border bg-background p-6 rounded-md shadow-lg"
                    >
                      <AlertDialogHeader className="space-y-2">
                        <AlertDialogTitle className="text-lg font-semibold text-destructive">
                          Are you sure delete this collection?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-muted-foreground">
                          This action cannot be undone. All items in this
                          collection will be removed from your wishlist.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <AlertDialogFooter className="mt-6 flex justify-end gap-3">
                        <AlertDialogClose className="px-4 py-2 cursor-pointer text-sm font-medium rounded-md border-secondary border hover:bg-muted/80 transition-colors">
                          Cancel
                        </AlertDialogClose>
                        <AlertDialogClose
                          onClick={handleDeleteCollection}
                          className="px-4 py-2 text-sm cursor-pointer font-medium rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                        >
                          Delete Collection
                        </AlertDialogClose>
                      </AlertDialogFooter>
                    </AlertDialogPopup>
                  </AlertDialogPortal>
                </AlertDialog>
              </>
            )}
          </span>
        </div>
        <div className="flex text-sm text-muted-foreground font-medium items-center gap-2 mt-2">
          {isCollection ? (
            isPrivate ? (
              <p className="flex items-center gap-1.5">
                <Lock size={16} /> Private Collection
              </p>
            ) : (
              <p>Public Collection</p>
            )
          ) : (
            "Product Category"
          )}
          <RxDividerVertical size={20} />
          <p>{itemCount} items</p>
        </div>
      </div>

      {/* <div className="w-full lg:w-sm flex justify-end">
        <InputGroup className="rounded-full bg-background h-9 lg:h-11 px-2">
          <InputGroupInput placeholder="Search your favourite items..." />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>
      </div> */}
    </section>
  );
}
