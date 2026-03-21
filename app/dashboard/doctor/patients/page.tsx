"use client"

import { useState } from "react"
import { useDoctorPatients, useStartConversation } from "@/hooks/queries"
import { useRouter } from "next/navigation"
import {
    UserIcon, BubbleChatIcon, Search01Icon,
    Calendar01Icon, Folder01Icon
} from "hugeicons-react"
import { Loader2 } from "lucide-react"

function getInitials(name: string) {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
}

const bloodGroupColors: Record<string, string> = {
    "A+": "bg-red-50 text-red-600",
    "A-": "bg-red-50 text-red-600",
    "B+": "bg-orange-50 text-orange-600",
    "B-": "bg-orange-50 text-orange-600",
    "AB+": "bg-purple-50 text-purple-600",
    "AB-": "bg-purple-50 text-purple-600",
    "O+": "bg-sky-50 text-sky-600",
    "O-": "bg-sky-50 text-sky-600",
}

export default function DoctorPatientsPage() {
    const [search, setSearch] = useState("")
    const { data: patients, isLoading } = useDoctorPatients()
    const startConversation = useStartConversation()
    const router = useRouter()

    const filtered = (patients || []).filter((p: any) =>
        p.full_name?.toLowerCase().includes(search.toLowerCase())
    )

    const handleMessage = async (patient: any) => {
        try {
            const result = await startConversation.mutateAsync(patient.user_id)
            router.push(`/dashboard/chat?room=${result.room_id}`)
        } catch { /* ignore */ }
    }

    return (
        <div className="space-y-6 max-w-3xl mx-auto lg:max-w-none">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">My Patients</h1>
                <p className="text-sm text-gray-500 font-medium mt-1">
                    {patients?.length || 0} unique patients from your appointment history
                </p>
            </div>

            {/* Search */}
            <div className="relative">
                <Search01Icon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search your patients by name..."
                    className="w-full h-14 pl-12 pr-4 text-[15px] font-medium rounded-full bg-white shadow-sm border border-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                />
            </div>

            {/* List */}
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200">
                    <UserIcon className="w-14 h-14 text-gray-300 mb-4" />
                    <p className="font-bold text-foreground">No patients found</p>
                    <p className="text-sm text-gray-500 mt-1">Try adjusting your search or wait for new appointments.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((patient: any) => (
                        <div
                            key={patient.patient_id}
                            className="bg-white border border-gray-100 rounded-[28px] p-5 shadow-sm hover:shadow-md hover:border-gray-200 transition-all flex flex-col gap-4"
                        >
                            <div className="flex items-start gap-4">
                                {/* Avatar */}
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                                    {patient.avatar_url ? (
                                        <img src={patient.avatar_url} alt="" className="w-full h-full object-cover rounded-2xl" />
                                    ) : (
                                        <span className="text-primary font-bold text-lg">{getInitials(patient.full_name)}</span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 pt-1">
                                    <p className="font-bold text-[16px] text-foreground truncate leading-tight">{patient.full_name}</p>
                                    <p className="text-xs font-semibold text-gray-500 mt-0.5">Patient #{patient.patient_id}</p>
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {patient.gender && (
                                            <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full uppercase tracking-widest">{patient.gender}</span>
                                        )}
                                        {patient.blood_group && (
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${bloodGroupColors[patient.blood_group] || "bg-gray-100 text-gray-600"}`}>
                                                {patient.blood_group}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 rounded-2xl p-3 flex flex-col gap-2 relative overflow-hidden">
                                <span className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                                    <Calendar01Icon className="w-3.5 h-3.5" />
                                    Last seen: {new Date(patient.last_visit).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                </span>
                                <span className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                                    <div className="w-3.5 h-3.5 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                    </div>
                                    <span className="capitalize">{patient.last_visit_type} visit</span>
                                </span>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 mt-auto pt-1">
                                <button
                                    onClick={() => handleMessage(patient)}
                                    disabled={startConversation.isPending}
                                    className="flex-1 h-11 rounded-2xl bg-primary/10 text-primary font-bold text-[13px] flex items-center justify-center gap-2 hover:bg-primary/20 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    <BubbleChatIcon className="w-4 h-4" /> Message
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
