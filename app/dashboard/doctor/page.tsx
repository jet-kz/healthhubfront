"use client"

import { useAppointments, useProfile, useUnreadCount, useDoctorPatients } from "@/hooks/queries"
import { useAuth } from "@/hooks/use-auth"
import { format } from "date-fns"
import Link from "next/link"
import {
    Calendar01Icon, UserMultipleIcon, 
    Medicine01Icon, BubbleChatIcon,
    ArrowRight01Icon, Clock01Icon,
    ChartHistogramIcon, CheckmarkCircle01Icon
} from "hugeicons-react"

export default function DoctorDashboardPage() {
    const { user } = useAuth()
    const { data: profile } = useProfile()
    const { data: appointments, isPending } = useAppointments()
    const { data: unreadCount } = useUnreadCount()
    const { data: patients } = useDoctorPatients()

    // Filter appointments for today
    const todayAppointments = appointments?.filter((apt: any) => {
        const aptDate = new Date(apt.appointment_date)
        const today = new Date()
        return aptDate.getDate() === today.getDate() &&
            aptDate.getMonth() === today.getMonth() &&
            aptDate.getFullYear() === today.getFullYear()
    }).sort((a: any, b: any) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime()) || []

    const nextAppointment = todayAppointments.find((apt: any) => apt.status === 'confirmed' || apt.status === 'pending')

    const hour = new Date().getHours()
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
    const firstName = profile?.full_name?.split(" ")[1] || user?.name?.split(' ')[1] || "Doctor"
    
    const today = new Date()
    const dateStr = today.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" })

    return (
        <div className="space-y-7 max-w-2xl mx-auto lg:max-w-none">

            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/settings" className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shrink-0 border-2 border-primary/20 overflow-hidden shadow-sm hover:scale-105 transition-transform active:scale-95">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-xl font-bold text-white">
                                {user?.name?.[0]?.toUpperCase() || "D"}
                            </span>
                        )}
                    </Link>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-[-0.03em] text-foreground">
                            {greeting}, Dr. {firstName}.
                        </h1>
                        <p className="text-sm text-gray-500 font-medium mt-0.5">{dateStr}</p>
                    </div>
                </div>
            </div>

            {/* ── Analytics & Overview ── */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                <div className="bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm flex flex-col gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                        <UserMultipleIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-foreground">{patients?.length || 0}</p>
                        <p className="text-xs font-medium text-gray-500">Total Patients</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm flex flex-col gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                        <Calendar01Icon className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-foreground">{appointments?.length || 0}</p>
                        <p className="text-xs font-medium text-gray-500">Total Bookings</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm flex flex-col gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                        <CheckmarkCircle01Icon className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-foreground">{appointments?.filter((a: any) => a.status === 'completed').length || 0}</p>
                        <p className="text-xs font-medium text-gray-500">Completed Sessions</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm flex flex-col gap-2">
                    <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center">
                        <ChartHistogramIcon className="w-4 h-4 text-rose-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-foreground">{todayAppointments.length}</p>
                        <p className="text-xs font-medium text-gray-500">Today's Load</p>
                    </div>
                </div>
            </div>

            {/* ── Quick Actions ── */}
            <div className="grid grid-cols-3 gap-3">
                <Link href="/dashboard/doctor/patients" className="flex flex-col items-center justify-center gap-3 p-4 rounded-[24px] bg-primary/10 hover:bg-primary/20 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                        <UserMultipleIcon className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-[13px] font-bold text-foreground">Patients</span>
                </Link>

                <Link href="/dashboard/doctor/prescriptions" className="flex flex-col items-center justify-center gap-3 p-4 rounded-[24px] bg-amber-50 hover:bg-amber-100 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                        <Medicine01Icon className="w-6 h-6 text-amber-600" />
                    </div>
                    <span className="text-[13px] font-bold text-foreground">Prescribe</span>
                </Link>

                <Link href="/dashboard/chat" className="flex flex-col items-center justify-center gap-3 p-4 rounded-[24px] bg-[#E8F3F1] hover:bg-[#d9ede9] transition-colors relative">
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

            {/* ── Next Patient Widget ── */}
            {nextAppointment ? (
                <div className="bg-[#1a2b4b] rounded-[32px] p-6 text-white relative overflow-hidden shadow-md">
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                                NEXT PATIENT
                            </span>
                        </div>
                        
                        <h2 className="text-2xl font-bold tracking-tight mb-1">
                            {nextAppointment.patient?.full_name || "Patient"}
                        </h2>
                        
                        <div className="flex items-center gap-4 text-white/80 text-sm mt-4">
                            <div className="flex items-center gap-1.5 font-medium">
                                <Calendar01Icon className="w-4 h-4" />
                                {format(new Date(nextAppointment.appointment_date), "MMM d")}
                            </div>
                            <div className="w-1 h-1 rounded-full bg-white/30" />
                            <div className="flex items-center gap-1.5 font-medium">
                                <Clock01Icon className="w-4 h-4" />
                                {format(new Date(nextAppointment.appointment_date), "h:mm a")}
                            </div>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-2">
                            <Link href="/dashboard/doctor/patients" className="bg-white text-[#1a2b4b] hover:bg-white/90 font-bold px-6 py-2.5 rounded-full text-sm transition-colors">
                                View Profile
                            </Link>
                            <Link href={`/dashboard/chat?userId=${nextAppointment.patient_id}`} className="bg-white/10 text-white hover:bg-white/20 font-bold px-6 py-2.5 rounded-full text-sm transition-colors backdrop-blur-sm">
                                Message
                            </Link>
                        </div>
                    </div>

                    <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-1/4 translate-y-1/4">
                        <UserMultipleIcon className="w-64 h-64" />
                    </div>
                </div>
            ) : (
                <div className="bg-gray-50 rounded-[32px] p-6 text-center border-2 border-dashed border-gray-200">
                    <UserMultipleIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-foreground">No upcoming patients</h3>
                    <p className="text-sm text-gray-500 mt-1 max-w-[250px] mx-auto">You have seen all your scheduled patients for the near future.</p>
                </div>
            )}

            {/* ── Today's Schedule ── */}
            <div>
                <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-lg font-bold text-foreground">Today's Schedule</h3>
                    <Link href="/dashboard/doctor/appointments" className="text-primary font-bold text-sm hover:opacity-80 flex items-center gap-1">
                        See all <ArrowRight01Icon className="w-4 h-4" />
                    </Link>
                </div>

                <div className="space-y-4">
                    {isPending ? (
                        <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-primary border-t-transparent animate-spin rounded-full"></div></div>
                    ) : todayAppointments.length > 0 ? (
                        todayAppointments.map((apt: any) => (
                            <div key={apt.id} className="flex gap-4">
                                {/* Time Column */}
                                <div className="w-16 pt-1 shrink-0 text-right">
                                    <p className="text-sm font-bold text-foreground">{format(new Date(apt.appointment_date), "h:mm")}</p>
                                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest leading-none">{format(new Date(apt.appointment_date), "a")}</p>
                                </div>
                                
                                {/* Timeline divider */}
                                <div className="w-0.5 bg-gray-100 relative shrink-0">
                                    <div className={`absolute top-2 -left-[5px] w-3 h-3 rounded-full border-2 border-white ${apt.status === 'confirmed' ? 'bg-primary' : apt.status === 'completed' ? 'bg-green-500' : 'bg-amber-400'}`} />
                                </div>

                                {/* Appointment Card */}
                                <div className="flex-1 bg-white p-4 rounded-3xl shadow-sm border border-gray-100 hover:border-gray-200 transition-colors">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                                                {apt.patient?.full_name?.charAt(0) || "P"}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-foreground">{apt.patient?.full_name || "Patient Name"}</p>
                                                <p className="text-xs font-medium text-gray-500 capitalize">{apt.type} Visit</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                            apt.status === 'completed' ? 'bg-green-100 text-green-700' :
                                            apt.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                            'bg-gray-100 text-gray-600'
                                        }`}>
                                            {apt.status}
                                        </span>
                                        <Link href={`/dashboard/chat?userId=${apt.patient_id}`} className="text-xs font-bold text-primary hover:underline">
                                            Message
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500 px-1">No appointments scheduled for today.</p>
                    )}
                </div>
            </div>

            {/* Spacer for bottom nav on mobile */}
            <div className="h-20 lg:hidden"></div>
        </div>
    )
}
