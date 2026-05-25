import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface DashboardTabItem<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

interface DashboardTabsProps<T extends string> {
  tabs: DashboardTabItem<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function DashboardTabs<T extends string>({
  tabs,
  value,
  onChange,
}: DashboardTabsProps<T>) {
  return (
    <div className="max-w-full overflow-x-auto rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
      <div className="flex min-w-max gap-1">
        {tabs.map((tab) => {
          const isActive = tab.value === value;

          return (
            <button
              key={tab.value}
              type="button"
              className={cn(
                "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-bold transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2",
                isActive
                  ? "bg-sky-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
              aria-pressed={isActive}
              onClick={() => onChange(tab.value)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
