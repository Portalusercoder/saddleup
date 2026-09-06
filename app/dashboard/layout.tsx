import ProfileGuard from "@/components/dashboard/ProfileGuard";
import CollapsibleSidebar from "@/components/dashboard/CollapsibleSidebar";
import MobileTabBar from "@/components/dashboard/MobileTabBar";
import PageTransition from "@/components/motion/PageTransition";
import TrialCTAModal from "@/components/dashboard/TrialCTAModal";
import UpgradeCTAModal from "@/components/dashboard/UpgradeCTAModal";
import DeletionGuard from "@/components/dashboard/DeletionGuard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProfileGuard>
      <DeletionGuard>
      <TrialCTAModal />
      <UpgradeCTAModal />
      <div className="min-h-screen bg-base text-black">
        <div className="su-sidebar-shell fixed start-0 bottom-0 z-[55] hidden md:block top-[var(--su-trial-bar-h,0px)] w-[var(--su-sidebar-w,15rem)] transition-[width] duration-300 overflow-visible">
          <CollapsibleSidebar />
        </div>
        <main className="ps-[max(0.75rem,env(safe-area-inset-left))] pe-[max(0.75rem,env(safe-area-inset-right))] md:ps-[var(--su-sidebar-w,15rem)] md:pe-12 sm:ps-6 sm:pe-6 py-6 sm:py-8 md:py-12 pb-28 md:pb-12 max-w-6xl mx-auto transition-[padding] duration-300">
          <PageTransition>{children}</PageTransition>
        </main>
        <MobileTabBar />
      </div>
      </DeletionGuard>
    </ProfileGuard>
  );
}
