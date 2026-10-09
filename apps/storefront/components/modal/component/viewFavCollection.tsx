import { Lock, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import defaultImg from "@/assets/images/noImg.png";
import { Badge } from "@/components/ui/badge";
import SectionTitle from "@/components/SectionTitle";

export default function ViewFavCollection() {
  return (
    <div className="w-full p-1 md:p-2 pb-12">
      <SectionTitle title="Your collection" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <Link
            href="?add-fav-collection-modal=add-fav-collection"
            className="bg-sidebar-border h-32 md:h-36 flex items-center justify-center text-card rounded-lg"
          >
            <Plus size={96} />
          </Link>
          <p className="text-sm text-center font-semibold mt-2 text-foreground">
            Add Collection
          </p>
        </div>
        <div>
          <div className="bg-sidebar-border h-32 md:h-36 relative rounded-lg">
            <Image
              className="h-32 md:h-36 object-cover w-full rounded-lg"
              src={defaultImg}
              alt="collection"
              width={500}
              height={500}
            />
            <Badge
              variant="outline"
              className="absolute bottom-1 right-1 bg-background"
            >
              <Lock /> Private
            </Badge>
          </div>
          <p className="text-sm text-center font-semibold mt-2 text-foreground">
            Watch
          </p>
        </div>
      </div>
    </div>
  );
}
