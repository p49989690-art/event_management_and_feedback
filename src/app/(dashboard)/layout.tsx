import Link from "next/link";
import { Button } from "@/components/ui/button";
import { logout } from "@/actions/auth.actions";
import { Calendar, MessageSquare, LayoutDashboard, LogOut } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r hidden md:flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-bold">EventDetails</h2>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <Button asChild variant="ghost" className="w-full justify-start">
            <Link href="/dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full justify-start">
            <Link href="/events">
              <Calendar className="mr-2 h-4 w-4" />
              Events
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full justify-start">
            <Link href="/feedback">
              <MessageSquare className="mr-2 h-4 w-4" />
              Feedback
            </Link>
          </Button>
        </nav>
        <div className="p-4 border-t">
          <form action={logout}>
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
