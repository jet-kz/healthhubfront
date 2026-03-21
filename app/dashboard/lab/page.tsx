"use client"

import { useAppointments, useLabProfile, useLabResults, useUnreadCount } from "@/hooks/queries"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import {
    TestTube01Icon, Calendar01Icon, ArrowRight01Icon,
    Clock01Icon, CheckmarkCircle01Icon,
    FileEditIcon, Building01Icon, BubbleChatIcon
} from "hugeicons-react"
import { format } from "date-fns"

export default function LabDashboardPage() {
    const { user } = useAuth()
    const { data: profile, isLoading: loadingProfile } = useLabProfile()
    const { data: appointments, isLoading: loadingAppts } = useAppointments()
    const { data: labResults } = useLabResults()
    const { data: unreadCount } = useUnreadCount()

    const hour = new Date().getHours()
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
    const today = new Date()

    const todayAppts = (appointments || []).filter((a: any) => {
        const d = new Date(a.appointment_date)
        return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
    }).sort((a: any, b: any) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())
    
    const pendingAppts = (appointments || []).filter((a: any) => a.status === "pending")
    const completedToday = todayAppts.filter((a: any) => a.status === "completed")
    const totalResults = labResults?.length || 0

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
                            {profile?.lab_name || user?.email?.split("@")[0] || "Lab"}
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
                        <p className="text-2xl font-bold text-foreground">{pendingAppts.length}</p>
                        <p className="text-xs font-medium text-gray-500">Pending Bookings</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm flex flex-col gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                        <Calendar01Icon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-foreground">{todayAppts.length}</p>
                        <p className="text-xs font-medium text-gray-500">Today's Load</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm flex flex-col gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                        <CheckmarkCircle01Icon className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-foreground">{completedToday.length}</p>
                        <p className="text-xs font-medium text-gray-500">Completed Today</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm flex flex-col gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
                        <TestTube01Icon className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-foreground">{totalResults}</p>
                        <p className="text-xs font-medium text-gray-500">Total Results Sent</p>
                    </div>
                </div>
            </div>

            {/* ── Quick Actions ── */}
            <div className="grid grid-cols-3 gap-3">
                <Link href="/dashboard/lab/appointments" className="flex flex-col items-center justify-center gap-3 p-4 rounded-[24px] bg-sky-50 hover:bg-sky-100 transition-colors border border-sky-100/50">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                        <Calendar01Icon className="w-6 h-6 text-sky-600" />
                    </div>
                    <span className="text-[13px] font-bold text-foreground">Bookings</span>
                </Link>

                <Link href="/dashboard/lab/results" className="flex flex-col items-center justify-center gap-3 p-4 rounded-[24px] bg-purple-50 hover:bg-purple-100 transition-colors border border-purple-100/50">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                        <TestTube01Icon className="w-6 h-6 text-purple-600" />
                    </div>
                    <span className="text-[13px] font-bold text-foreground">Results</span>
                </Link>

                <Link href="/dashboard/chat" className="flex flex-col items-center justify-center gap-3 p-4 rounded-[24px] bg-[#E8F3F1] hover:bg-[#d9ede9] transition-colors border border-[#d9ede9]/50 relative">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm relative">
                        {(unreadCount || 0) > 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white text-[10px] font-bold text-white">
                                {unreadCount! > 99 ? '99+' : unreadCount}
                            </div>
                        )}
                        <BubbleChatIcon className="w-6 h-6 text-[#1A4B43]" />
                    </div>
                    <span className="text-[13px] font-bold text-foreground">Messages</span>
                </Link>
            </div>

            {/* ── Today's Schedule ── */}
            <div>
                <div className="flex items-center justify-between mb-4 px-1">
                    <h2 className="text-lg font-bold tracking-tight text-foreground">Today&apos;s Tests</h2>
                    <Link href="/dashboard/lab/appointments" className="text-sm text-primary font-bold flex items-center gap-1 hover:opacity-80">
                        View all <ArrowRight01Icon className="w-4 h-4" />
                    </Link>
                </div>

                <div className="space-y-4">
                    {loadingAppts ? (
                        <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-primary border-t-transparent animate-spin rounded-full"></div></div>
                    ) : todayAppts.length === 0 ? (
                        <div className="bg-gray-50 rounded-[32px] p-6 text-center border-2 border-dashed border-gray-200">
                            <TestTube01Icon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                            <p className="font-bold text-foreground">No tests scheduled today</p>
                            <p className="text-sm text-gray-500 mt-1">Appointments will show here when booked.</p>
                        </div>
                    ) : (
                        todayAppts.slice(0, 5).map((appt: any) => (
                            <div key={appt.id} className="flex gap-4">
                                {/* Time Column */}
                                <div className="w-16 pt-1 shrink-0 text-right">
                                    <p className="text-sm font-bold text-foreground">{format(new Date(appt.appointment_date), "h:mm")}</p>
                                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest leading-none">{format(new Date(appt.appointment_date), "a")}</p>
                                </div>
                                
                                {/* Timeline */}
                                <div className="w-0.5 bg-gray-100 relative shrink-0">
                                    <div className={`absolute top-2 -left-[5px] w-3 h-3 rounded-full border-2 border-white ${appt.status === 'confirmed' ? 'bg-sky-500' : appt.status === 'completed' ? 'bg-green-500' : 'bg-amber-400'}`} />
                                </div>

                                {/* Card */}
                                <div className="flex-1 bg-white p-4 justify-between rounded-3xl shadow-sm border border-gray-100 hover:border-gray-200 transition-colors flex items-center gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center shrink-0">
                                            <span className="text-sky-600 font-bold text-sm">
                                                {appt.patient?.full_name?.charAt(0) || "P"}
                                            </span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-sm text-foreground truncate">
                                                {appt.patient?.full_name || `Patient #${appt.patient_id}`}
                                            </p>
                                            <p className="text-xs text-gray-500 capitalize font-medium">{appt.type} test</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                                            appt.status === "confirmed" ? "bg-sky-100 text-sky-700" :
                                            appt.status === "pending" ? "bg-amber-100 text-amber-700" :
                                            "bg-green-100 text-green-700"
                                        }`}>
                                            {appt.status}
                                        </span>
                                        <Link href={`/dashboard/chat?userId=${appt.patient_id}`} className="text-xs font-bold text-primary hover:underline">
                                            Message
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* ── Services offered ── */}
            {profile?.services_offered && profile.services_offered.length > 0 && (
                <div>
                    <h2 className="text-lg font-bold tracking-tight text-foreground mb-4 px-1">Services Offered</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {profile.services_offered.map((svc: any, i: number) => (
                            <div key={i} className="bg-white border border-gray-100 rounded-[24px] p-4 shadow-sm hover:border-gray-200 transition-colors">
                                <p className="font-bold text-[13px] text-foreground leading-tight">{svc.name}</p>
                                {svc.price && <p className="text-sm text-primary font-black mt-1.5">₦{svc.price}</p>}
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
