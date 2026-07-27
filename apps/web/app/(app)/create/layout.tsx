export default function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100svh-var(--header-height))] flex-1 flex-col">
      {children}
    </div>
  );
}
