import type { ReactNode } from "react";
import { navIcons, type NavIconKey } from "./nav-icons";

export type DashboardRole = "owner" | "trainer" | "student" | "guardian";

export type NavItemDef = {
  href: string;
  labelPath: string;
  icon: ReactNode;
};

export type NavSectionDef = {
  sectionKey: string;
  items: NavItemDef[];
};

function item(href: string, labelPath: string, iconKey: NavIconKey): NavItemDef {
  return { href, labelPath, icon: navIcons[iconKey] };
}

const ownerNav: NavSectionDef[] = [
  {
    sectionKey: "home",
    items: [item("/dashboard", "navRole.dashboard", "dashboard")],
  },
  {
    sectionKey: "horses",
    items: [
      item("/dashboard/horses", "navRole.horses", "horses"),
      item("/dashboard/matching", "navRole.matching", "matching"),
    ],
  },
  {
    sectionKey: "people",
    items: [item("/dashboard/team", "navRole.teamManagement", "team")],
  },
  {
    sectionKey: "sessions",
    items: [
      item("/dashboard/bookings", "navRole.bookings", "bookings"),
      item("/dashboard/schedule", "navRole.schedule", "schedule"),
    ],
  },
  {
    sectionKey: "insights",
    items: [
      item("/dashboard/analytics", "navRole.analytics", "analytics"),
      item("/dashboard/incidents", "navRole.incidents", "incidents"),
      item("/dashboard/activity", "navRole.activity", "activity"),
    ],
  },
  {
    sectionKey: "communicate",
    items: [item("/dashboard/notices", "navRole.notices", "notices")],
  },
  {
    sectionKey: "account",
    items: [
      item("/dashboard/settings", "navRole.settings", "settings"),
      item("/dashboard/plans", "navRole.plans", "plans"),
      item("/dashboard/profile", "navRole.profile", "profile"),
    ],
  },
];

const trainerNav: NavSectionDef[] = [
  {
    sectionKey: "home",
    items: [item("/dashboard", "navRole.dashboard", "dashboard")],
  },
  {
    sectionKey: "horses",
    items: [
      item("/dashboard/horses", "navRole.horses", "horses"),
      item("/dashboard/matching", "navRole.matching", "matching"),
    ],
  },
  {
    sectionKey: "people",
    items: [item("/dashboard/team", "navRole.teamManagement", "team")],
  },
  {
    sectionKey: "sessions",
    items: [
      item("/dashboard/bookings", "navRole.bookings", "bookings"),
      item("/dashboard/schedule", "navRole.schedule", "schedule"),
    ],
  },
  {
    sectionKey: "insights",
    items: [
      item("/dashboard/analytics", "navRole.analytics", "analytics"),
      item("/dashboard/incidents", "navRole.incidents", "incidents"),
      item("/dashboard/activity", "navRole.activity", "activity"),
    ],
  },
  {
    sectionKey: "account",
    items: [item("/dashboard/profile", "navRole.profile", "profile")],
  },
];

const studentNav: NavSectionDef[] = [
  {
    sectionKey: "home",
    items: [item("/dashboard", "navRole.dashboard", "dashboard")],
  },
  {
    sectionKey: "horses",
    items: [item("/dashboard/my-horses", "navRole.myHorses", "horses")],
  },
  {
    sectionKey: "sessions",
    items: [
      item("/dashboard/bookings", "navRole.myBookings", "bookings"),
      item("/dashboard/training-history", "navRole.trainingHistory", "trainingHistory"),
      item("/dashboard/competitions", "navRole.competitions", "competitions"),
    ],
  },
  {
    sectionKey: "account",
    items: [item("/dashboard/profile", "navRole.profile", "profile")],
  },
];

const guardianNav: NavSectionDef[] = [
  {
    sectionKey: "home",
    items: [item("/dashboard/guardian", "navRole.parentPortal", "guardian")],
  },
  {
    sectionKey: "account",
    items: [item("/dashboard/profile", "navRole.profile", "profile")],
  },
];

export const dashboardNavByRole: Record<DashboardRole, NavSectionDef[]> = {
  owner: ownerNav,
  trainer: trainerNav,
  student: studentNav,
  guardian: guardianNav,
};

export function getDashboardNavSections(role: string | undefined): NavSectionDef[] {
  if (role && role in dashboardNavByRole) {
    return dashboardNavByRole[role as DashboardRole];
  }
  return ownerNav;
}

/** Flat list for mobile nav drawers. */
export function flattenDashboardNav(sections: NavSectionDef[]): NavItemDef[] {
  return sections.flatMap((s) => s.items);
}
