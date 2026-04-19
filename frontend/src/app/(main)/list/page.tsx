import { Suspense } from "react";
import { ListContent } from "./ListContent";

export default function ListPage() {
  return (
    <Suspense
      fallback={
        <p className="text-slate-600">加载列表…</p>
      }
    >
      <ListContent />
    </Suspense>
  );
}
