"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Building2, 
  MapPin, 
  QrCode, 
  Clock, 
  Settings, 
  BarChart3,
  FileText,
  Users
} from "lucide-react";

interface DashboardNavProps {
  user: any;
}

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname();
  const userRole = user?.user_metadata?.role || "user";

  const userNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard/user",
      icon: Home,
    },
    {
      title: "Find Spaces",
      href: "/dashboard/user/spaces",
      icon: MapPin,
    },
    {
      title: "My Access",
      href: "/dashboard/user/access",
      icon: QrCode,
    },
    {
      title: "Profile",
      href: "/dashboard/user/profile",
      icon: Users,
    },
  ];

  const partnerNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard/partner",
      icon: Home,
    },
    {
      title: "My Spaces",
      href: "/dashboard/partner/spaces",
      icon: Building2,
    },
    {
      title: "Access Logs",
      href: "/dashboard/partner/logs",
      icon: FileText,
    },
    {
      title: "Analytics",
      href: "/dashboard/partner/analytics",
      icon: BarChart3,
    },
    {
      title: "Settings",
      href: "/dashboard/partner/settings",
      icon: Settings,
    },
  ];

  const navItems = userRole === "partner" ? partnerNavItems : userNavItems;

  return (
    <nav className="flex flex-1 flex-col px-4 pb-4">
      <ul role="list" className="flex flex-1 flex-col gap-y-7">
        <li>
          <ul role="list" className="-mx-2 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.title}>
                  <Link
                    href={item.href}
                    className={cn(
                      isActive
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                        : "text-gray-700 hover:text-blue-700 hover:bg-blue-50 dark:text-gray-300 dark:hover:text-blue-300 dark:hover:bg-blue-900/20",
                      "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors"
                    )}
                  >
                    <item.icon
                      className={cn(
                        isActive ? "text-blue-700 dark:text-blue-300" : "text-gray-400 group-hover:text-blue-700 dark:group-hover:text-blue-300",
                        "h-6 w-6 shrink-0 transition-colors"
                      )}
                      aria-hidden="true"
                    />
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </li>
      </ul>
    </nav>
  );
} 