"use client";

import { usePathname } from "next/navigation";

export default function PagePadding({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password";
  const isDashboard = pathname.startsWith("/dashboard");
  const isHome = pathname === "/";
  const isMarketingSubpage =
    pathname === "/for-schools" || pathname === "/for-trainers";

  if (isAuthPage || isHome || isMarketingSubpage) {
    return <>{children}</>;
  }

  if (isDashboard) {
    return <div className="pt-20">{children}</div>;
  }

  return <div className="pt-20 px-4 sm:px-6 md:px-10">{children}</div>;
}
