"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function DeletionGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (pathname === "/dashboard/reactivate") {
      setChecked(true);
      return;
    }
    fetch("/api/stable")
      .then((r) => r.json())
      .then((d) => {
        if (d.scheduledDeletionAt) {
          router.replace("/dashboard/reactivate");
          return;
        }
        setChecked(true);
      })
      .catch(() => setChecked(true));
  }, [pathname, router]);

  if (!checked && pathname !== "/dashboard/reactivate") {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-white/50">Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}
