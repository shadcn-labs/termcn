import { cn } from "@/lib/utils";

export const MacWindow = ({
  children,
  className,
  title,
  trailing,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  trailing?: React.ReactNode;
}) => (
  <div
    data-slot="mac-window"
    className={cn(
      "overflow-hidden rounded-2xl border bg-card shadow-lg",
      className
    )}
  >
    <div className="grid grid-cols-3 items-center border-b bg-muted/50 px-3 py-2.5">
      <div className="flex gap-2">
        <div className="size-3 rounded-full bg-red-500" />
        <div className="size-3 rounded-full bg-yellow-500" />
        <div className="size-3 rounded-full bg-green-500" />
      </div>
      {title && (
        <div className="select-none text-center text-sm text-muted-foreground">
          {title}
        </div>
      )}
      {trailing ? <div className="flex justify-end">{trailing}</div> : <div />}
    </div>
    <div className="overflow-x-auto overscroll-x-none">{children}</div>
  </div>
);
