import ProfileGuard from "@/components/dashboard/ProfileGuard";
import CollapsibleSidebar from "@/components/dashboard/CollapsibleSidebar";
import TrialBanner from "@/components/dashboard/TrialBanner";
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
        <div className="fixed left-0 top-0 bottom-0 z-[60] hidden md:block">
          <CollapsibleSidebar />
        </div>
        <main className="pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] md:pl-56 sm:px-6 md:px-12 py-6 sm:py-8 md:py-12 max-w-6xl mx-auto">
          <TrialBanner />
          {children}
        </main>
      </div>
      </DeletionGuard>
    </ProfileGuard>
  );
}
