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

  // Offset = navbar height + optional trial bar (CSS var set by TrialBanner)
  const withNavOffset = (extra = "") =>
    `pt-[calc(5rem+var(--su-trial-bar-h,0px))] ${extra}`.trim();

  if (isAuthPage || isHome || isMarketingSubpage) {
    // Home/marketing use their own hero layout; still push content when trial bar shows on logged-in home
    if ((isHome || isMarketingSubpage) && !isAuthPage) {
      return (
        <div style={{ paddingTop: "var(--su-trial-bar-h, 0px)" }}>{children}</div>
      );
    }
    return <>{children}</>;
  }

  if (isDashboard) {
    return <div className={withNavOffset()}>{children}</div>;
  }

  return <div className={withNavOffset("px-4 sm:px-6 md:px-10")}>{children}</div>;
}
