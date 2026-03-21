"use client"

import {
    Calendar,
    Home,
    Settings,
    User,
    Activity,
    LogOut,
    FileText,
    Search
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarFooter,
    SidebarHeader
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"

// Menu items.
const items = [
    {
        title: "Overview",
        url: "/dashboard",
        icon: Home,
    },
    {
        title: "Appointments",
        url: "/dashboard/appointments",
        icon: Calendar,
    },
    {
        title: "Medical Records",
        url: "/dashboard/records",
        icon: FileText,
    },
    {
        title: "Find Doctors",
        url: "/dashboard/search",
        icon: Search,
    },
    {
        title: "Profile",
        url: "/dashboard/profile",
        icon: User,
    },
    {
        title: "Settings",
        url: "/dashboard/settings",
        icon: Settings,
    },
]

export function AppSidebar() {
    const pathname = usePathname()
    const { user, logout } = useAuth()

    return (
        <Sidebar>
            <SidebarHeader className="p-4 border-b">
                <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl px-2">
                    <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                        <Activity className="h-5 w-5" />
                    </div>
                    <span>JetCare</span>
                </Link>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="p-4 border-t">
                {user && (
                    <div className="mb-3 px-2 py-2 rounded-lg bg-muted/50">
                        <p className="text-sm font-medium truncate">{user.name || user.email || 'User'}</p>
                        <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                    </div>
                )}
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild onClick={() => logout()} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950">
                            <button>
                                <LogOut />
                                <span>Sign Out</span>
                            </button>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
