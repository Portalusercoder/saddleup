"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import PageLoader from "@/components/ui/PageLoader";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function DeletionGuard({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
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
    return <PageLoader minHeight="min-h-[40vh]" message={t("common.loading")} />;
  }

  return <>{children}</>;
}
