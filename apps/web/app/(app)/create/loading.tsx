import { Skeleton } from "@/components/ui/skeleton";

export default function CreateLoading() {
  return (
    <div className="section-soft flex flex-1 flex-col gap-4 p-4 md:flex-row-reverse md:gap-6 md:p-6">
      <Skeleton className="min-h-[32rem] flex-1 rounded-2xl" />
      <Skeleton className="min-h-72 w-full rounded-2xl md:min-h-[32rem] md:w-48 2xl:w-56" />
    </div>
  );
}
