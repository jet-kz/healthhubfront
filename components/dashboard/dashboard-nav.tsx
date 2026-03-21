"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    Calendar,
    FileText,
    Search,
    User,
    Settings,
    LogOut,
    Activity
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"

export function DashboardNav() {
    const pathname = usePathname()
    const { logout } = useAuth()

    const navItems = [
        {
            title: "Overview",
            href: "/dashboard",
            icon: LayoutDashboard,
        },
        {
            title: "Appointments",
            href: "/dashboard/appointments",
            icon: Calendar,
        },
        {
            title: "Medical Records",
            href: "/dashboard/records",
            icon: FileText,
        },
        {
            title: "Find Doctors",
            href: "/dashboard/search",
            icon: Search,
        },
        {
            title: "Profile",
            href: "/dashboard/profile",
            icon: User,
        },
        {
            title: "Settings",
            href: "/dashboard/settings",
            icon: Settings,
        },
    ]

    return (
        <nav className="flex flex-col h-full border-r bg-card w-full md:w-64">
            <div className="p-6">
                <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl">
                    <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                        <Activity className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span>Health</span>
                </Link>
            </div>

            <div className="flex-1 px-4 space-y-2 py-4">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                            pathname === item.href
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <item.icon className="h-4 w-4" />
                        {item.title}
                    </Link>
                ))}
            </div>

            <div className="p-4 border-t">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                    onClick={() => logout()}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </Button>
            </div>
        </nav>
    )
}
