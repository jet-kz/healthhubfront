"use client"

import Link from "next/link"
import { Home, Calendar, FileText, User } from "lucide-react"
import { usePathname } from "next/navigation"

const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Calendar, label: "Appointments", href: "/dashboard/appointments" },
    { icon: FileText, label: "Records", href: "/dashboard/records" },
    { icon: User, label: "Profile", href: "/dashboard" },
]

export function BottomNav() {
    const pathname = usePathname()

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-50">
            <div className="flex items-center justify-around h-16">
                {navItems.map(({ icon: Icon, label, href }) => {
                    const isActive = pathname === href
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${isActive
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-primary"
                                }`}
                        >
                            <Icon className={`h-5 w-5 ${isActive ? "fill-current" : ""}`} />
                            <span className="text-xs font-medium">{label}</span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
