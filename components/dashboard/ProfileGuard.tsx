"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/components/providers/ProfileProvider";
import LoadingScreen from "@/components/ui/LoadingScreen";

export default function ProfileGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { profile, loading, error } = useProfile();

  useEffect(() => {
    if (loading) return;
    if (error === "Profile not found") {
      router.replace("/removed");
    }
  }, [loading, error, router]);

  if (loading) {
    return <LoadingScreen fullPage />;
  }

  if (error === "Profile not found") {
    return null;
  }

  return <>{children}</>;
}
