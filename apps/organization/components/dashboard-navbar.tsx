"use client";

import { Building2, Bell, Settings } from "lucide-react";

interface DashboardNavbarProps {
  organizationName?: string;
  userEmail?: string;
}

export function DashboardNavbar({ organizationName, userEmail }: DashboardNavbarProps) {
  return (
    <header className="border-b bg-card">
      <div className="flex h-16 items-center px-6 gap-4">
        <div className="flex items-center gap-2 flex-1">
          <Building2 className="h-6 w-6" />
          <div>
            <h1 className="text-lg font-semibold">{organizationName || "Organization"}</h1>
            {userEmail && (
              <p className="text-xs text-muted-foreground">{userEmail}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-accent rounded-lg transition-colors">
            <Bell className="h-5 w-5" />
          </button>
          <button className="p-2 hover:bg-accent rounded-lg transition-colors">
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
