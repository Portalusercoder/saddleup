import ProfileGuard from "@/components/dashboard/ProfileGuard";
import CollapsibleSidebar from "@/components/dashboard/CollapsibleSidebar";
import TrialBanner from "@/components/dashboard/TrialBanner";
import TrialCTAModal from "@/components/dashboard/TrialCTAModal";
import UpgradeCTAModal from "@/components/dashboard/UpgradeCTAModal";
import DeletionGuard from "@/components/dashboard/DeletionGuard";

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
      <div className="min-h-screen bg-black text-white">
        <div className="fixed left-0 top-20 bottom-0 z-30 hidden md:block">
          <CollapsibleSidebar />
        </div>
        <main className="pl-0 md:pl-[4.25rem] max-w-6xl mx-auto px-4 sm:px-6 md:px-12 py-6 sm:py-8 md:py-12">
          <TrialBanner />
          {children}
        </main>
      </div>
      </DeletionGuard>
    </ProfileGuard>
  );
}
