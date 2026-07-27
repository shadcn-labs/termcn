import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export const Callout = ({
  title,
  children,
  icon,
  className,
  ...props
}: React.ComponentProps<typeof Alert> & { icon?: React.ReactNode }) => (
  <Alert
    className={cn(
      "bg-surface text-surface-foreground mt-6 w-auto border-none md:-mx-1",
      className
    )}
    {...props}
  >
    {icon}
    {title && <AlertTitle>{title}</AlertTitle>}
    <AlertDescription className="text-card-foreground/80">
      {children}
    </AlertDescription>
  </Alert>
);
