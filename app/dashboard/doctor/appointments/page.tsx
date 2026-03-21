"use client"

import { useState } from "react"
import { useAppointments, useUpdateAppointmentStatus } from "@/hooks/queries"
import { format } from "date-fns"
import {
    Calendar01Icon, Clock01Icon, CheckmarkCircle01Icon,
    Cancel01Icon, UserIcon, ArrowRight01Icon, Tick02Icon,
    FilterIcon
} from "hugeicons-react"
import { Loader2 } from "lucide-react"

const TABS = ["All", "Pending", "Confirmed", "Completed", "Cancelled"] as const
type Tab = typeof TABS[number]

const statusColor: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    confirmed: "bg-blue-100 text-blue-700 border-blue-200",
    completed: "bg-green-100 text-green-700 border-green-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
}

export default function DoctorAppointmentsPage() {
    const [activeTab, setActiveTab] = useState<Tab>("All")
    const { data: appointments, isLoading } = useAppointments()
    const updateStatus = useUpdateAppointmentStatus()

    const filtered = (appointments || []).filter((a: any) => {
        if (activeTab === "All") return true
        return a.status?.toLowerCase() === activeTab.toLowerCase()
    })

    const today = new Date()
    const isToday = (dateStr: string) => {
        const d = new Date(dateStr)
        return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
    }

    const handleUpdate = (id: number, status: string) => {
        updateStatus.mutate({ id, status })
    }

    const todayCount = (appointments || []).filter((a: any) => isToday(a.appointment_date)).length
    const pendingCount = (appointments || []).filter((a: any) => a.status === "pending").length

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Appointments</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {todayCount} today · {pendingCount} pending approval
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full">
                    <Clock01Icon className="w-3.5 h-3.5" />
                    {pendingCount} Pending
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1.5 bg-muted/50 p-1 rounded-2xl overflow-x-auto">
                {TABS.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 min-w-fit px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                            activeTab === tab
                                ? "bg-card text-foreground shadow-sm border border-border"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* List */}
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Calendar01Icon className="w-14 h-14 text-muted-foreground/20 mb-4" />
                    <p className="font-bold text-foreground">No {activeTab.toLowerCase()} appointments</p>
                    <p className="text-sm text-muted-foreground mt-1">They'll show up here when booked.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((appt: any) => {
                        const today_ = isToday(appt.appointment_date)
                        const status = appt.status?.toLowerCase() || "pending"
                        return (
                            <div
                                key={appt.id}
                                className={`bg-card border border-border rounded-[24px] p-5 shadow-sm transition-all ${today_ ? "ring-2 ring-primary/20 border-primary/30" : ""}`}
                            >
                                {today_ && (
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full w-fit mb-3">
                                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                                        TODAY
                                    </div>
                                )}
                                <div className="flex items-start gap-4">
                                    {/* Avatar */}
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                                        <span className="text-primary font-bold text-sm">
                                            {appt.patient?.full_name?.charAt(0) || "P"}
                                        </span>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="font-bold text-[15px] text-foreground">
                                                {appt.patient?.full_name || `Patient #${appt.patient_id}`}
                                            </p>
                                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border capitalize ${statusColor[status] || "bg-muted text-muted-foreground"}`}>
                                                {status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Calendar01Icon className="w-3.5 h-3.5" />
                                                {format(new Date(appt.appointment_date), "MMM d, yyyy")}
                                            </span>
                                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Clock01Icon className="w-3.5 h-3.5" />
                                                {format(new Date(appt.appointment_date), "h:mm a")}
                                            </span>
                                            <span className="text-xs font-semibold text-primary/80 bg-primary/5 px-2 py-0.5 rounded-full capitalize">
                                                {appt.type}
                                            </span>
                                        </div>
                                        {appt.notes && (
                                            <p className="text-xs text-muted-foreground mt-2 bg-muted/50 rounded-xl px-3 py-2 border border-border">
                                                &ldquo;{appt.notes}&rdquo;
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Action buttons */}
                                {status === "pending" && (
                                    <div className="flex gap-2 mt-4">
                                        <button
                                            onClick={() => handleUpdate(appt.id, "confirmed")}
                                            disabled={updateStatus.isPending}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-2xl text-sm font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
                                        >
                                            <Tick02Icon className="w-4 h-4" /> Confirm
                                        </button>
                                        <button
                                            onClick={() => handleUpdate(appt.id, "cancelled")}
                                            disabled={updateStatus.isPending}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-muted text-muted-foreground rounded-2xl text-sm font-bold hover:bg-red-50 hover:text-red-600 transition-all disabled:opacity-50"
                                        >
                                            <Cancel01Icon className="w-4 h-4" /> Decline
                                        </button>
                                    </div>
                                )}
                                {status === "confirmed" && (
                                    <div className="flex gap-2 mt-4">
                                        <button
                                            onClick={() => handleUpdate(appt.id, "completed")}
                                            disabled={updateStatus.isPending}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500 text-white rounded-2xl text-sm font-bold hover:bg-green-600 transition-all disabled:opacity-50"
                                        >
                                            <CheckmarkCircle01Icon className="w-4 h-4" /> Mark Complete
                                        </button>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
