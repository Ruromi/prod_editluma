import { Suspense } from "react";
import BillingPageClient from "@/components/BillingPageClient";

function BillingPageFallback() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="space-y-6">
        <div className="h-40 rounded-3xl border border-gray-800 bg-gray-900/60 animate-pulse" />
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-[22rem] rounded-3xl border border-gray-800 bg-gray-900/60 animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<BillingPageFallback />}>
      <BillingPageClient />
    </Suspense>
  );
}
