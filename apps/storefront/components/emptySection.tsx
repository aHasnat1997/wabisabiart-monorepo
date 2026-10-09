import { PackageSearch } from "lucide-react";

export default function EmptySection({
  title,
  message = "Nothing is available here right now. Please check back later.",
}: {
  title: string;
  message?: string;
}) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
      <PackageSearch className="h-10 w-10 text-muted-foreground" />
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
