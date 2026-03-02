"use client";

interface TableSkeletonProps {
  /** Number of table body rows */
  rows?: number;
  /** Number of columns (excluding actions column if any) */
  cols?: number;
  /** Show top bar with search + button placeholders */
  showHeaderBar?: boolean;
  /** Show bottom bar (pagination/actions) */
  showBottomBar?: boolean;
  /** Optional className for the wrapper */
  className?: string;
}

export default function TableSkeleton({
  rows = 6,
  cols = 4,
  showHeaderBar = true,
  showBottomBar = true,
  className = "",
}: TableSkeletonProps) {
  return (
    <div className={className}>
      {showHeaderBar && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="skeleton h-10 w-48 max-w-full" />
            <div className="skeleton h-10 w-28 rounded" />
          </div>
          <div className="skeleton h-10 w-32 rounded" />
        </div>
      )}

      <div className="border border-white/10 overflow-hidden rounded">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10">
            <tr>
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="px-6 py-4">
                  <div className="skeleton h-3 w-16" />
                </th>
              ))}
              <th className="px-6 py-4 w-24">
                <div className="skeleton h-3 w-12" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: cols }).map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4">
                    <div
                      className="skeleton h-4"
                      style={{
                        width: colIndex === 0 ? "60%" : colIndex === 1 ? "75%" : "40%",
                      }}
                    />
                  </td>
                ))}
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <div className="skeleton h-8 w-8 rounded" />
                    <div className="skeleton h-8 w-8 rounded" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showBottomBar && (
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-2">
            <div className="skeleton h-8 w-8 rounded-full" />
            <div className="skeleton h-4 w-24" />
          </div>
          <div className="flex items-center gap-2">
            <div className="skeleton h-8 w-20 rounded" />
            <div className="skeleton h-8 w-8 rounded" />
          </div>
        </div>
      )}
    </div>
  );
}
