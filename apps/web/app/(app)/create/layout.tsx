export default function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex min-h-0 flex-1 flex-col">{children}</div>;
}
