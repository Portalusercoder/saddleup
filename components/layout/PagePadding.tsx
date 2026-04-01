"use client";

import { usePathname } from "next/navigation";

export default function PagePadding({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isDashboard = pathname.startsWith("/dashboard");
  return (
    <div
      className={
        isAuthPage
          ? ""
          : isDashboard
            ? "pt-20"
            : "pt-20 px-4 sm:px-6 md:px-10"
      }
    >
      {children}
    </div>
  );
}
