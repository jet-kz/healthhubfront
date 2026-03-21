"use client"

import { useAppointments, useUpdateAppointmentStatus } from "@/hooks/queries"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Calendar, Clock, MapPin, User } from "lucide-react"
import { BubbleChatIcon } from "hugeicons-react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

export default function AppointmentsPage() {
    const { data: appointments, isPending } = useAppointments()
    const { mutate: updateStatus, isPending: isUpdating } = useUpdateAppointmentStatus()
    const router = useRouter()

    const handleReschedule = (aptId: number) => {
        // Simple reschedule flow: cancel current and redirect to book new
        updateStatus({ id: aptId, status: 'cancelled' }, {
            onSuccess: () => {
                router.push('/dashboard/search')
            }
        })
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Appointments</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your upcoming and past visits.
                    </p>
                </div>
            </div>

            {isPending ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : appointments && appointments.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {appointments.map((apt: any) => {
                        const isDoctor = !!apt.doctor;
                        const isLab = !!apt.lab;
                        const providerName = isDoctor ? apt.doctor.full_name : (isLab ? apt.lab.lab_name : "Provider");
                        const specialty = isDoctor ? apt.doctor.specialization : (isLab ? "Diagnostic Lab" : "Healthcare Services");
                        const providerUserId = isDoctor ? apt.doctor.user_id : (isLab ? apt.lab.user_id : null);
                        const initial = providerName.charAt(0).toUpperCase();

                        return (
                            <div key={apt.id} className="bg-card border border-border rounded-3xl p-5 card-shadow hover:card-shadow-md transition-all group flex flex-col">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                            <span className="text-lg font-bold text-primary">{initial}</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-base text-foreground line-clamp-1">{providerName}</h3>
                                            <p className="text-xs font-medium text-muted-foreground">{specialty}</p>
                                        </div>
                                    </div>
                                    <StatusBadge status={apt.status} />
                                </div>
                                
                                <div className="space-y-2.5 mb-5 flex-1 p-3 bg-muted/50 rounded-2xl">
                                    <div className="flex items-center gap-2.5 text-sm text-foreground">
                                        <Calendar className="h-4 w-4 text-primary shrink-0" />
                                        <span className="font-medium">{format(new Date(apt.appointment_date), "MMM d, yyyy")}</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 text-sm text-foreground">
                                        <Clock className="h-4 w-4 text-primary shrink-0" />
                                        <span className="font-medium">{format(new Date(apt.appointment_date), "h:mm a")}</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 text-sm text-foreground">
                                        <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center shrink-0">
                                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                        </div>
                                        <span className="font-medium capitalize">{apt.type} Visit</span>
                                    </div>
                                    {apt.notes && (
                                        <p className="text-xs text-muted-foreground italic mt-2 line-clamp-2 border-t border-border pt-2">
                                            "{apt.notes}"
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 mt-auto">
                                    {apt.status === "pending" || apt.status === "confirmed" ? (
                                        <>
                                            {providerUserId && (
                                                <button 
                                                    onClick={() => router.push(`/dashboard/chat?userId=${providerUserId}`)}
                                                    className="w-10 flex border border-primary/20 items-center justify-center bg-primary/10 text-primary hover:bg-primary/20 rounded-xl transition-colors"
                                                    title="Message Provider"
                                                >
                                                    <BubbleChatIcon className="w-5 h-5" />
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => handleReschedule(apt.id)}
                                                disabled={isUpdating}
                                                className="flex-1 bg-amber-50 border border-amber-200 text-amber-600 hover:bg-amber-100 font-semibold text-xs py-2.5 rounded-xl transition-colors disabled:opacity-50"
                                            >
                                                Reschedule
                                            </button>
                                            <button 
                                                onClick={() => updateStatus({ id: apt.id, status: 'cancelled' })}
                                                disabled={isUpdating}
                                                className="flex-1 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 font-semibold text-xs py-2.5 rounded-xl transition-colors disabled:opacity-50"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                        {providerUserId && (
                                            <button 
                                                onClick={() => router.push(`/dashboard/chat?userId=${providerUserId}`)}
                                                className="flex-1 bg-primary border text-primary-foreground border-primary hover:bg-primary/90 font-semibold text-sm py-2.5 rounded-xl transition-colors"
                                            >
                                                Message
                                            </button>
                                        )}
                                        <button className="flex-1 bg-primary/5 text-primary border border-primary/20 hover:bg-primary/10 font-semibold text-sm py-2.5 rounded-xl transition-colors">
                                            View Details
                                        </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-muted/30 border border-dashed border-border rounded-3xl">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Calendar className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">No appointments</h3>
                    <p className="text-sm text-muted-foreground mt-1 text-center max-w-sm">
                        You don't have any upcoming or past visits. Book an appointment with a doctor to get started.
                    </p>
                </div>
            )}
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const variants: Record<string, string> = {
        pending: "bg-muted text-muted-foreground",
        confirmed: "bg-green-100 text-green-700",
        cancelled: "bg-red-100 text-red-700",
        completed: "bg-primary/10 text-primary"
    }

    const badgeClass = variants[status.toLowerCase()] || variants.pending;

    return (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}>
            {status}
        </span>
    )
}
