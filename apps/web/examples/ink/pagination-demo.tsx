import { useState } from "react";

import { Pagination } from "@/registry/bases/ink/ui/pagination";

export default function PaginationDemo() {
  const [page, setPage] = useState(1);

  return (
    <Pagination total={10} current={page} onChange={setPage} siblings={1} />
  );
}
