import { Skeleton } from "@/components/ui/skeleton";

export default function CreateLoading() {
  return (
    <div className="section-soft flex flex-1 gap-4 p-4 md:gap-6 md:p-6">
      <Skeleton className="min-h-[32rem] flex-1 rounded-2xl" />
      <Skeleton className="hidden w-48 rounded-2xl md:block 2xl:w-56" />
    </div>
  );
}
