import { Suspense } from "react";
import UnsubscribeClient from "./UnsubscribeClient";

function UnsubscribeFallback() {
  return (
    <div className="min-h-screen bg-base flex items-center justify-center text-white/60 text-sm">
      Loading…
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<UnsubscribeFallback />}>
      <UnsubscribeClient />
    </Suspense>
  );
}
