import { Skeleton } from "@/components/ui/skeleton";

export default function CreateLoading() {
  return (
    <div className="section-soft flex min-h-0 flex-1 flex-col gap-4 p-4 pt-1 md:flex-row-reverse md:gap-6 md:p-6 md:pt-1.5">
      <Skeleton className="flex-1 rounded-2xl" />
      <Skeleton className="min-h-[151px] w-full self-start rounded-2xl md:h-full md:max-h-full md:min-h-0 md:w-48 2xl:w-56" />
    </div>
  );
}
