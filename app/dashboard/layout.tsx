"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    Home01Icon as Home, Calendar01Icon as Calendar, 
    Note01Icon as FileText, UserIcon as User, FavouriteIcon as Heart, 
    Logout01Icon as LogOut, Notification01Icon as Bell, Settings01Icon as Settings,
    BubbleChatIcon as Chat, TestTube01Icon as TestTube,
    File01Icon,
    Medicine01Icon as Medicine, UserMultipleIcon as Patients
} from "hugeicons-react"
import { useAuth } from "@/hooks/use-auth"
import { useProfile, useUnreadCount } from "@/hooks/queries"
import { usePushNotifications } from "@/hooks/use-push-notifications"

const patientNav = [
    { label: "Home", href: "/dashboard", icon: Home },
    { label: "Appointments", href: "/dashboard/appointments", icon: Calendar },
    { label: "Records", href: "/dashboard/records", icon: FileText },
    { label: "Chat", href: "/dashboard/chat", icon: Chat },
    { label: "Profile", href: "/dashboard/profile", icon: User },
]

const doctorNav = [
    { label: "Dashboard", href: "/dashboard/doctor", icon: Home },
    { label: "Appointments", href: "/dashboard/doctor/appointments", icon: Calendar },
    { label: "Patients", href: "/dashboard/doctor/patients", icon: Patients },
    { label: "Prescriptions", href: "/dashboard/doctor/prescriptions", icon: Medicine },
    { label: "Chat", href: "/dashboard/chat", icon: Chat },
    { label: "Profile", href: "/dashboard/doctor/profile", icon: User },
]

const labNav = [
    { label: "Dashboard", href: "/dashboard/lab", icon: Home },
    { label: "Bookings", href: "/dashboard/lab/appointments", icon: Calendar },
    { label: "Tests Catalog", href: "/dashboard/lab/tests", icon: TestTube },
    { label: "Results", href: "/dashboard/lab/results", icon: File01Icon },
    { label: "Chat", href: "/dashboard/chat", icon: Chat },
    { label: "Profile", href: "/dashboard/lab/profile", icon: User },
]

const pharmacyNav = [
    { label: "Dashboard", href: "/dashboard/pharmacy", icon: Home },
    { label: "Prescriptions", href: "/dashboard/pharmacy/prescriptions", icon: Medicine },
    { label: "Chat", href: "/dashboard/chat", icon: Chat },
    { label: "Profile", href: "/dashboard/pharmacy/profile", icon: User },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const { user, logout } = useAuth()
    const { data: profile } = useProfile()
    const { data: unreadCount } = useUnreadCount()
    const role = user?.role?.toLowerCase()
    const navItems = role === 'doctor' ? doctorNav : role === 'lab' ? labNav : role === 'pharmacy' ? pharmacyNav : patientNav;

    const isActive = (href: string) => {
        if (["/dashboard", "/dashboard/doctor", "/dashboard/lab", "/dashboard/pharmacy"].includes(href)) {
            return pathname === href
        }
        return pathname.startsWith(href)
    }

    const { permission, requestPermission } = usePushNotifications()

    return (
        <div className="min-h-screen bg-background flex">
            {/* ... Desktop Sidebar ... */}
            <aside className="hidden lg:flex flex-col w-[240px] min-h-screen bg-card border-r border-border fixed left-0 top-0 z-30">
                {/* Logo */}
                <div className="flex items-center gap-2 px-5 h-16 shrink-0">
                    <div className="w-8 h-8 bg-sky-500 rounded-xl flex items-center justify-center shadow-lg shadow-sky-200">
                        <Heart className="w-4 h-4 text-white" fill="currentColor" />
                    </div>
                    <span className="font-bold text-base tracking-tight text-foreground">JetCare</span>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                    {navItems.map(({ label, href, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`
                                flex items-center gap-3 h-10 px-3 rounded-xl text-sm font-medium transition-all
                                ${isActive(href)
                                    ? "bg-sky-500 text-white shadow-md shadow-sky-100"
                                    : "text-muted-foreground hover:bg-muted"
                                }
                            `}
                        >
                            <Icon className="w-4 h-4 shrink-0" fill={isActive(href) ? "currentColor" : "none"} />
                            {label}
                        </Link>
                    ))}

                    {/* Divider */}
                    <div className="my-3 border-t border-border" />

                    <Link
                        href={role === 'doctor' ? "/dashboard/doctor/profile" : role === 'lab' ? "/dashboard/lab/profile" : role === 'pharmacy' ? "/dashboard/pharmacy/profile" : "/dashboard/profile"}
                        className={`
                            flex items-center gap-3 h-10 px-3 rounded-xl text-sm font-medium transition-all
                            ${isActive(role === 'doctor' ? "/dashboard/doctor/profile" : role === 'lab' ? "/dashboard/lab/profile" : role === 'pharmacy' ? "/dashboard/pharmacy/profile" : "/dashboard/profile")
                                ? "bg-sky-500 text-white shadow-md shadow-sky-100"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }
                        `}
                    >
                        <Settings className="w-4 h-4 shrink-0" />
                        Settings
                    </Link>
                </nav>

                {/* User card at bottom */}
                <div className="p-3">
                    <div className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-muted transition-all group cursor-pointer">
                        <div className="w-9 h-9 bg-sky-100 rounded-full flex items-center justify-center shrink-0 overflow-hidden border border-sky-200">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-xs font-bold text-sky-600">
                                    {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                                </span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate text-foreground leading-tight">
                                {profile?.full_name || user?.name || user?.email || "User"}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{user?.role || "patient"}</p>
                        </div>
                        <button
                            onClick={() => logout()}
                            className="transition-all p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
                            title="Sign out"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* ─── Main content column ─── */}
            <div className="flex-1 lg:ml-[240px] flex flex-col min-h-screen">

                {/* Top header (mobile + desktop) */}
                <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md h-16 flex items-center px-4 sm:px-6 gap-3 border-b border-border/40">
                    
                    {/* Desktop: page info */}
                    <div className="hidden lg:flex items-center gap-2.5 text-sm text-muted-foreground flex-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                        {navItems.find(n => isActive(n.href)) && (
                            <span className="text-foreground font-bold text-base tracking-tight">
                                {navItems.find(n => isActive(n.href))?.label}
                            </span>
                        )}
                        {!navItems.find(n => isActive(n.href)) && pathname.includes('settings') && (
                            <span className="text-foreground font-bold text-base tracking-tight">Settings</span>
                        )}
                    </div>

                    {/* Mobile: Logo/Icon to balance the bell */}
                    <div className="flex lg:hidden items-center gap-2 flex-1">
                        <div className="w-8 h-8 bg-sky-500 rounded-xl flex items-center justify-center">
                            <Heart className="w-4 h-4 text-white" fill="currentColor" />
                        </div>
                        <span className="font-bold text-[15px] tracking-tight text-foreground line-clamp-1">
                            {navItems.find(n => isActive(n.href))?.label || "JetCare"}
                        </span>
                    </div>

                    {/* Right side: notification bell */}
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={requestPermission}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all relative
                            ${permission === 'granted' ? "bg-muted text-foreground" : "bg-sky-50 text-sky-600 hover:bg-sky-100 border border-sky-100 shadow-sm"}
                        `}>
                            <Bell className="w-4 h-4" />
                            {permission !== 'granted' && (
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-destructive rounded-full border-2 border-white shadow-sm ring-2 ring-sky-50" />
                            )}
                        </button>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 px-4 sm:px-6 py-5 pb-24 lg:pb-8">
                    {children}
                </main>
            </div>

            {/* ─── Mobile Bottom Tab Bar ─── */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border">
                <div className="flex items-center justify-around px-2 h-[68px] safe-area-bottom">
                    {navItems.map(({ label, href, icon: Icon }) => {
                        const active = isActive(href)
                        const isChat = href === "/dashboard/chat"
                        const badge = isChat && unreadCount && unreadCount > 0 ? unreadCount : null
                        return (
                            <Link
                                key={href}
                                href={href}
                                className="flex flex-col items-center justify-center gap-1 flex-1 py-1 rounded-xl transition-all"
                            >
                                <div className={`
                                    w-12 h-8 rounded-full flex items-center justify-center transition-all relative
                                    ${active ? "bg-primary" : "bg-transparent"}
                                `}>
                                    <Icon className={`w-5 h-5 transition-colors ${active ? "text-white" : "text-muted-foreground"}`} fill={active ? "currentColor" : "none"} />
                                    {badge && (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                                            {badge > 9 ? "9+" : badge}
                                        </span>
                                    )}
                                </div>
                                <span className={`text-[10px] font-medium transition-colors leading-none mt-0.5 ${active ? "text-primary" : "text-muted-foreground"}`}>
                                    {label}
                                </span>
                            </Link>
                        )
                    })}
                </div>
            </nav>
        </div>
    )
}
