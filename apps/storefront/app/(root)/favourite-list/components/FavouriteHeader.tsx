"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RxDividerVertical } from "react-icons/rx";
import Link from "next/link";

interface FavouriteHeaderProps {
  name: string;
  avatarSrc?: string;
}

export default function FavouriteHeader({
  name,
  avatarSrc,
}: FavouriteHeaderProps) {
  return (
    <div className="flex items-center gap-5 mb-8">
      {/* <Avatar className="w-16 md:w-20 h-16 md:h-20 rounded-full">
        <AvatarImage src={avatarSrc ?? ""} alt={name} />
        <AvatarFallback className="bg-sidebar-border font-medium text-2xl md:text-3xl">
          {initials}
        </AvatarFallback>
      </Avatar> */}
      <span className="text-foreground flex flex-col gap-2 md:gap-3">
        <h4 className="font-semibold text-xl md:text-2xl">{name}</h4>
        {/* <span className="flex items-center gap-2">
          <Link className="hover:text-primary" href="#">
            About
          </Link>
          <RxDividerVertical className="size-6 md:size-8" />
          <Link className="hover:text-primary" href="#">
            Settings
          </Link>
        </span> */}
      </span>
    </div>
  );
}
