"use client";

import { formUrlQuery, removeKeysFromQuery } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { PropsWithChildren } from "react";
import {
  Dialog,
  DialogPanel,

} from "@/components/animate-ui/components/headless/dialog";

import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer, DrawerContent, } from "../ui/drawer";
import { ScrollArea } from "../ui/scroll-area";

interface ModalProps {
  modalId: string;
  openId: string;
  title?: string;
  cleanupKeys?: string[];
}

export default function Modal({
  openId,
  modalId,
  children,
  cleanupKeys = [],
}: PropsWithChildren<ModalProps>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modal = searchParams.get(modalId);
  const isMobile = useIsMobile();

  const handleClose = () => {
    const newUrl = removeKeysFromQuery({
      params: searchParams.toString(),
       keysToRemove: [modalId, ...cleanupKeys],
    });

    // replace URL without scrolling
    router.replace(newUrl || "/", { scroll: false });
  };

  const handleDrawerOpenChange = (open: boolean) => {
    if (!open) {
      handleClose();
    }
  };

  if (isMobile) {
    return (
      <Drawer
        // direction="bottom"
        open={modal === openId}
        onOpenChange={handleDrawerOpenChange}
      >
        <DrawerContent
          aria-describedby={undefined}
          className="bg-card p-0 overflow-hidden"
        >
          <ScrollArea className="h-[80vh] px-4">{children}</ScrollArea>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={modal === openId} onClose={handleClose}>
      <DialogPanel
        aria-describedby={undefined}
        className="bg-card sm:max-w-150 rounded-2xl p-0 overflow-hidden"
      >
        <ScrollArea className="max-h-[90vh] p-4">{children}</ScrollArea>
      </DialogPanel>
    </Dialog>
  );
}

export function useModal() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const open = (modalId: string, openId: string) => {
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: modalId,
      value: openId,
    });

    // replace URL without scrolling
    router.replace(newUrl || "/", { scroll: false });
  };

  const close = (modalId: string, extraKeys: string[] = []) => {
    const newUrl = removeKeysFromQuery({
      params: searchParams.toString(),
      keysToRemove: [modalId, ...extraKeys],
    });

    // replace URL without scrolling
    router.replace(newUrl || "/", { scroll: false });
  };

  return { open, close };
}
