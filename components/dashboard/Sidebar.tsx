"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Horses", href: "/dashboard/horses" },
  { name: "Settings", href: "/dashboard/settings" },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 min-h-screen bg-neutral-950 border-r border-neutral-800 flex flex-col">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-neutral-800">
        <div className="text-lg font-semibold tracking-tight">
          Saddle Up
        </div>
        <p className="text-xs text-neutral-500 mt-0.5">
          Management Dashboard
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
        {navItems.map((item) => {
          const isActive = pathname === item.href

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center rounded-lg px-3 py-2 transition-all
                ${
                  isActive
                    ? "bg-neutral-800 text-white"
                    : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
                }
              `}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full mr-3 transition-opacity
                  ${
                    isActive
                      ? "bg-white opacity-100"
                      : "bg-neutral-500 opacity-0 group-hover:opacity-100"
                  }
                `}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-neutral-800 text-xs text-neutral-500">
        © Saddle Up
      </div>
    </aside>
  )
}
