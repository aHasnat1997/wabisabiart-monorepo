"use client";

import {
  CircleQuestionMark,
  Gift,
  Heart,
  LogOut,
  MessageCircleMore,
  Menu as MenuIcon,
  Search,
  Settings,
  ShoppingCart,
  LayoutGrid,
} from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { LuNotepadText } from "react-icons/lu";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../animate-ui/components/radix/dialog";
import {
  Menu,
  MenuTrigger,
  MenuPanel,
  MenuGroup,
  MenuItem,
  MenuSeparator,
} from "../animate-ui/components/base/menu";
import { Button } from "../animate-ui/components/buttons/button";
import { logoutUser } from "@/lib/action";
import { toast } from "sonner";
import { User } from "@/types/auth";
import { getInitials } from "@/lib/getInitials";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavClientProps {
  authenticated: boolean;
  profileData?: User;
  logo: React.ReactNode;
}

type MenuItemConfig = {
  label: string;
  href: string;
  icon: React.ElementType;
  /** If true, renders a separator BEFORE this item */
  separatorBefore?: boolean;
};

// ─── Role menu config ─────────────────────────────────────────────────────────

const CUSTOMER_MENU: MenuItemConfig[] = [
  { label: "Your Orders", href: "/profile/order", icon: LuNotepadText },
  { label: "Message", href: "/profile/inbox", icon: MessageCircleMore },
  {
    label: "Sell on WabiSabiArt",
    href: "?seller-signup-modal=seller-signup",
    icon: Gift,
    separatorBefore: true,
  },
  { label: "Help Center", href: "/help", icon: CircleQuestionMark },
  { label: "Account Settings", href: "/profile/account", icon: Settings },
];

const SELLER_MENU: MenuItemConfig[] = [
  { label: "Dashboard", href: "/seller-dashboard", icon: LayoutGrid },
];

const CATEGORY_LINKS = [
  { label: "Crafts", href: "/products?filter[categoryType]=crafts" },
  {
    label: "Customization",
    href: "/products?filter[categoryType]=customization",
  },
  { label: "Commissions", href: "/products?filter[categoryType]=commissions" },
  { label: "Vintage", href: "/products?filter[categoryType]=vintage" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Shared avatar + name + email block inside the dropdown label */
function UserMenuLabel({
  fullName,
  email,
  avatarSrc,
}: {
  fullName: string;
  email: string;
  avatarSrc?: string;
}) {
  return (
    <DropdownMenuLabel className="rounded-md bg-background mb-4">
      <div className="flex items-center gap-2">
        <Avatar className="w-9 md:w-11 h-9 md:h-11 border-2 md:border-3 rounded-full p-1">
          <AvatarImage
            src={avatarSrc}
            alt={fullName}
            className="rounded-full"
          />
          <AvatarFallback className="bg-sidebar-border font-medium text-xs md:text-sm">
            {getInitials(fullName)}
          </AvatarFallback>
        </Avatar>
        <span>
          <h4 className="text-foreground">{fullName}</h4>
          <p className="text-muted-foreground text-xs">{email}</p>
        </span>
      </div>
    </DropdownMenuLabel>
  );
}

/** Renders role-specific menu items + logout */
function RoleMenuItems({
  items,
  onNavigate,
  onLogout,
}: {
  items: MenuItemConfig[];
  onNavigate: (href: string) => void;
  onLogout: () => void;
}) {
  return (
    <>
      {items.map(({ label, href, icon: Icon, separatorBefore }) => (
  <>
    {separatorBefore && <DropdownMenuSeparator key={`sep-${label}`} />}
    <DropdownMenuItem
      key={label}
      className="group text-muted-foreground hover:text-card cursor-pointer font-medium gap-2"
      onClick={() => onNavigate(href)}
    >
      <Icon className="size-5 text-muted-foreground group-hover:text-card transition-colors" />
      {label}
    </DropdownMenuItem>
  </>
))}
<DropdownMenuSeparator />
<DropdownMenuItem
  className="group text-destructive hover:text-card hover:bg-destructive! cursor-pointer font-medium gap-2"
  onClick={onLogout}
>
  <LogOut className="size-5 text-destructive group-hover:text-card transition-colors" />
  Sign Out
</DropdownMenuItem>
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function NavbarClient({
  authenticated,
  profileData,
  logo,
}: NavClientProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const isMobile = useIsMobile();
  const router = useRouter();

  const handleNavigate = (path: string) => {
    setIsDropdownOpen(false);
    router.push(path);
  };

  const handleLogout = async () => {
    await logoutUser();
    toast.success("Logout successful");
    window.location.pathname = "/";
  };

  const avatarSrc = profileData?.avatarUrl
    ? `${process.env.NEXT_PUBLIC_MEDIA_URL}${profileData.avatarUrl}`
    : undefined;

  const roleMenuItems =
    profileData?.role === "customer"
      ? CUSTOMER_MENU
      : profileData?.role === "seller"
        ? SELLER_MENU
        : [];

  return (
    <div className="flex items-center gap-4 justify-between w-full">
      {/* ── Left: hamburger (mobile) + logo ──────────────────────── */}
      <div className="flex items-center gap-2">
        <Menu>
          <MenuTrigger className="hover:text-primary cursor-pointer block md:hidden">
            <MenuIcon />
          </MenuTrigger>

          <MenuPanel align="start">
            <MenuGroup className="font-medium">
              {authenticated && (
                <>
                  <MenuItem onClick={() => router.push("/help")}>
                    <CircleQuestionMark className="size-4" /> Help
                  </MenuItem>
                  <MenuItem onClick={() => router.push("/profile/cart")}>
                    <ShoppingCart className="size-4" /> Cart
                  </MenuItem>
                </>
              )}
              <MenuItem onClick={() => router.push("/favourite-list")}>
                <Heart className="size-4" /> Wishlist
              </MenuItem>
              <MenuSeparator />
              {CATEGORY_LINKS.map(({ label, href }) => (
                <MenuItem key={label} onClick={() => router.push(href)}>
                  {label}
                </MenuItem>
              ))}
            </MenuGroup>
          </MenuPanel>
        </Menu>

        {logo}
      </div>

      {/* ── Right: search + auth ──────────────────────────────────── */}
      <div className="flex items-center gap-2 md:gap-16 lg:gap-40">
        {/* Search */}
        {isMobile ? (
          <>
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 cursor-pointer hover:bg-background rounded-md"
            >
              <Search className="size-5" />
            </button>
            <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
              <DialogContent className="top-0 translate-y-0 max-w-full w-full p-2 rounded-none border-x-0 border-t-0">
                <DialogHeader className="sr-only">
                  <DialogTitle>Search</DialogTitle>
                </DialogHeader>
                <InputGroup className="rounded-full flex-1">
                  <InputGroupInput placeholder="Search..." autoFocus />
                  <InputGroupAddon>
                    <Search />
                  </InputGroupAddon>
                </InputGroup>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <InputGroup className="rounded-full w-xs lg:w-md xl:w-xl h-10 lg:h-11 px-2">
            <InputGroupInput placeholder="Search..." />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
          </InputGroup>
        )}

        {/* Auth actions */}
        <div className="flex items-center gap-2 md:gap-4.5">
          {authenticated ? (
            <>
              {/* Desktop-only quick links */}
              <Link
                className="hover:text-destructive cursor-pointer hidden md:block"
                href="/favourite-list"
              >
                <Heart className="hover:fill-destructive" />
              </Link>
              <Link href="/help">
                <button className="hidden md:flex items-center gap-1.5 hover:text-primary cursor-pointer p-2">
                  <CircleQuestionMark /> Help
                </button>
              </Link>

              <Link href="/profile/cart">
                <button className="flex items-center gap-1.5 hover:text-primary cursor-pointer p-2">
                  <ShoppingCart />
                  <span className="hidden md:block">Cart</span>
                </button>
              </Link>

              {/* Avatar dropdown */}
              <DropdownMenu
                open={isDropdownOpen}
                onOpenChange={setIsDropdownOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Avatar className="w-11 md:w-13 h-11 md:h-13 border-3 md:border-4 rounded-full p-1 cursor-pointer">
                    <AvatarImage
                      src={avatarSrc}
                      alt={profileData?.fullName ?? ""}
                      className="rounded-full"
                    />
                    <AvatarFallback className="bg-sidebar-border font-medium text-sm md:text-base">
                      {getInitials(profileData?.fullName ?? "")}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  className="w-56 md:w-64 border-primary/50 shadow-2xl"
                  align="end"
                >
                  {profileData && (
                    <>
                      <UserMenuLabel
                        fullName={profileData.fullName}
                        email={profileData.email}
                        avatarSrc={avatarSrc}
                      />
                      <RoleMenuItems
                        items={roleMenuItems}
                        onNavigate={handleNavigate}
                        onLogout={handleLogout}
                      />
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="?seller-signup-modal=seller-signup">
                <Button className="rounded-full" variant="outline">
                  <span className="hidden [@media(min-width:375px)]:inline">
                    Become a{" "}
                  </span>
                  Seller
                </Button>
              </Link>
              <Link href="?signin-modal=signin">
                <Button className="rounded-full">Sign In</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}