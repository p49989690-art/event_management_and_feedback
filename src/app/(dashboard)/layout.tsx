"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { logout } from "@/actions/auth.actions";
import { ThemeToggle } from "@/components/theme-toggle";
import { Calendar, MessageSquare, LayoutDashboard, LogOut, Menu, X } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/events", icon: Calendar, label: "Events" },
    { href: "/feedback", icon: MessageSquare, label: "Feedback" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-black">
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-4 bg-white dark:bg-black border-b dark:border-neutral-800 md:hidden">
        <h2 className="text-lg font-bold dark:text-white">Event Management</h2>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 h-screen bg-white dark:bg-black border-r dark:border-neutral-800 transform transition-transform duration-200 ease-in-out md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } flex flex-col pt-16 md:pt-0`}
      >
        <div className="p-6 hidden md:block">
          <h2 className="text-xl font-bold dark:text-white">Event Management</h2>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4 md:mt-0">
          {navItems.map((item) => (
            <Button
              key={item.href}
              asChild
              variant="ghost"
              className="w-full justify-start dark:text-neutral-200 dark:hover:bg-neutral-900"
              onClick={() => setSidebarOpen(false)}
            >
              <Link href={item.href}>
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          ))}
        </nav>
        <div className="p-4 border-t dark:border-neutral-800 space-y-2">
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
          <form action={logout} className="w-full">
            <Button
              type="submit"
              variant="outline"
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 dark:border-neutral-700"
            >
              <div className="flex items-center gap-2 w-full">
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </div>
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto pt-20 md:pt-8 min-h-screen dark:bg-black">{children}</main>
    </div>
  );
}
