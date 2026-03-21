"use client"

import { useAppointments, usePharmacyProfile, usePrescriptions, useUnreadCount } from "@/hooks/queries"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import {
    Medicine01Icon, Calendar01Icon, ArrowRight01Icon,
    Clock01Icon, CheckmarkCircle01Icon, Building01Icon,
    BubbleChatIcon
} from "hugeicons-react"

export default function PharmacyDashboardPage() {
    const { user } = useAuth()
    const { data: profile } = usePharmacyProfile()
    const { data: appointments } = useAppointments()
    const { data: prescriptions } = usePrescriptions()
    const { data: unreadCount } = useUnreadCount()

    const hour = new Date().getHours()
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
    const today = new Date()

    const todayAppts = (appointments || []).filter((a: any) => {
        const d = new Date(a.appointment_date)
        return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
    })
    const pendingRx = (prescriptions || []).filter((p: any) => p.status === "pending").length
    const filledToday = (prescriptions || []).filter((p: any) => p.status === "filled").length

    return (
        <div className="space-y-7 max-w-2xl mx-auto lg:max-w-none">

            {/* ── Header Banner ── */}
            <div
                className="relative rounded-[28px] overflow-hidden p-6 shadow-md"
                style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%)" }}
            >
                <div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(circle at 90% 10%, white 0%, transparent 60%)" }} />
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <p className="text-white/70 text-sm font-medium">{greeting}</p>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
                            {profile?.pharmacy_name || user?.email?.split("@")[0] || "Pharmacy"}
                        </h1>
                        {profile?.city && (
                            <p className="text-white/60 text-[13px] font-medium mt-1.5 flex items-center gap-1.5">
                                <Building01Icon className="w-3.5 h-3.5" /> {profile.city}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Analytics Overview ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                <div className="bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm flex flex-col gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                        <Clock01Icon className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-foreground">{pendingRx}</p>
                        <p className="text-xs font-medium text-gray-500">Pending Scripts</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm flex flex-col gap-2">
                    <div className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center">
                        <CheckmarkCircle01Icon className="w-4 h-4 text-sky-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-foreground">{filledToday}</p>
                        <p className="text-xs font-medium text-gray-500">Filled Today</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm flex flex-col gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                        <Calendar01Icon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-foreground">{todayAppts.length}</p>
                        <p className="text-xs font-medium text-gray-500">Today's Appts</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm flex flex-col gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
                        <Medicine01Icon className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-foreground">{prescriptions?.length || 0}</p>
                        <p className="text-xs font-medium text-gray-500">Total Scripts</p>
                    </div>
                </div>
            </div>

            {/* ── Quick Actions ── */}
            <div className="grid grid-cols-3 gap-3">
                <Link href="/dashboard/pharmacy/prescriptions" className="flex flex-col items-center justify-center gap-3 p-4 rounded-[24px] bg-sky-50 hover:bg-sky-100 transition-colors border border-sky-100/50">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                        <Medicine01Icon className="w-6 h-6 text-sky-600" />
                    </div>
                    <span className="text-[13px] font-bold text-foreground">Scripts</span>
                </Link>

                <Link href="/dashboard/pharmacy/profile" className="flex flex-col items-center justify-center gap-3 p-4 rounded-[24px] bg-sky-50 hover:bg-sky-100 transition-colors border border-sky-100/50">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                        <Building01Icon className="w-6 h-6 text-sky-600" />
                    </div>
                    <span className="text-[13px] font-bold text-foreground">Profile</span>
                </Link>

                <Link href="/dashboard/chat" className="flex flex-col items-center justify-center gap-3 p-4 rounded-[24px] bg-sky-50 hover:bg-sky-100 transition-colors border border-sky-100/50 relative">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm relative">
                        {(unreadCount || 0) > 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white text-[10px] font-bold text-white">
                                {unreadCount! > 99 ? '99+' : unreadCount}
                            </div>
                        )}
                        <BubbleChatIcon className="w-6 h-6 text-sky-800" />
                    </div>
                    <span className="text-[13px] font-bold text-foreground">Messages</span>
                </Link>
            </div>

            {/* ── Recent Prescriptions ── */}
            <div>
                <div className="flex items-center justify-between mb-4 px-1">
                    <h2 className="text-lg font-bold tracking-tight text-foreground">Recent Prescriptions</h2>
                    <Link href="/dashboard/pharmacy/prescriptions" className="text-sm text-primary font-bold flex items-center gap-1 hover:opacity-80">
                        View all <ArrowRight01Icon className="w-4 h-4" />
                    </Link>
                </div>

                {(prescriptions || []).length === 0 ? (
                    <div className="bg-gray-50 rounded-[32px] p-6 text-center border-2 border-dashed border-gray-200">
                        <Medicine01Icon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                        <p className="font-bold text-foreground">No prescriptions yet</p>
                        <p className="text-sm text-gray-500 mt-1">Incoming prescriptions will appear here.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {(prescriptions || []).slice(0, 4).map((rx: any) => (
                            <div key={rx.id} className="bg-white border border-gray-100 rounded-[28px] p-4 shadow-sm hover:border-gray-200 transition-colors flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-12 h-12 rounded-[16px] bg-sky-50 flex items-center justify-center shrink-0">
                                        <Medicine01Icon className="w-6 h-6 text-sky-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-extrabold text-[15px] text-foreground tracking-tight">Rx #{rx.prescription_code}</p>
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-0.5">{rx.medications?.length || 0} meds • Patient #{rx.patient_id}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2 shrink-0">
                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                                        rx.status === "pending" ? "bg-amber-100 text-amber-700" :
                                        rx.status === "filled" ? "bg-sky-100 text-sky-700" :
                                        "bg-gray-100 text-gray-600"
                                    }`}>{rx.status}</span>
                                    <Link href={`/dashboard/chat?userId=${rx.patient_id}`} className="text-xs font-bold text-primary hover:underline">
                                        Message
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Operating Hours ── */}
            {profile?.operating_hours && Object.keys(profile.operating_hours).length > 0 && (
                <div>
                    <h2 className="text-lg font-bold tracking-tight text-foreground mb-4 px-1">Operating Hours</h2>
                    <div className="bg-white border border-gray-100 rounded-[24px] p-5 shadow-sm grid grid-cols-2 gap-x-6 gap-y-3">
                        {Object.entries(profile.operating_hours).map(([day, hours]) => (
                            <div key={day} className="flex flex-col py-1.5 border-b border-gray-50 last:border-0">
                                <span className="text-[13px] font-bold text-foreground capitalize">{day}</span>
                                <span className="text-xs font-semibold text-gray-500">{String(hours)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Spacer for bottom nav on mobile */}
            <div className="h-20 lg:hidden"></div>
        </div>
    )
}
