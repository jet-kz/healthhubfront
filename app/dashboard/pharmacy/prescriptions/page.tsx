"use client"

import { useState } from "react"
import { usePrescriptions, useFillPrescription } from "@/hooks/queries"
import {
    Medicine01Icon, CheckmarkCircle01Icon,
    Clock01Icon, Cancel01Icon, Tick02Icon
} from "hugeicons-react"
import { Loader2 } from "lucide-react"

export default function PharmacyPrescriptionsPage() {
    const { data: prescriptions, isLoading } = usePrescriptions()
    const fillPrescription = useFillPrescription()
    const [fillConfirm, setFillConfirm] = useState<number | null>(null)

    const sorted = [...(prescriptions || [])].sort((a: any, b: any) => {
        if (a.status === "pending" && b.status !== "pending") return -1
        if (b.status === "pending" && a.status !== "pending") return 1
        return 0
    })

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Prescriptions</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {(prescriptions || []).filter((p: any) => p.status === "pending").length} pending to fill
                    </p>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : sorted.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Medicine01Icon className="w-14 h-14 text-muted-foreground/20 mb-4" />
                    <p className="font-bold text-foreground">No prescriptions yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Prescriptions issued to your pharmacy will appear here.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {sorted.map((rx: any) => {
                        const status = rx.status?.toLowerCase()
                        const isPending = status === "pending"
                        return (
                            <div key={rx.id} className={`bg-card border rounded-[24px] p-5 shadow-sm transition-all ${isPending ? "border-amber-200 ring-1 ring-amber-100" : "border-border"}`}>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isPending ? "bg-amber-100" : status === "filled" ? "bg-sky-100" : "bg-muted"}`}>
                                            <Medicine01Icon className={`w-4 h-4 ${isPending ? "text-amber-600" : status === "filled" ? "text-sky-600" : "text-muted-foreground"}`} fill="currentColor" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-foreground">Rx #{rx.prescription_code}</p>
                                            <p className="text-xs text-muted-foreground">Patient #{rx.patient_id}</p>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full capitalize ${
                                        status === "pending" ? "bg-amber-100 text-amber-700" :
                                        status === "filled" ? "bg-sky-100 text-sky-700" :
                                        "bg-red-100 text-red-700"
                                    }`}>{status}</span>
                                </div>

                                {/* Medications */}
                                <div className="space-y-1.5 mb-3">
                                    {rx.medications?.map((med: any, i: number) => (
                                        <div key={i} className="flex items-center gap-2 bg-muted/40 rounded-xl px-3 py-2 border border-border">
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                            <span className="text-sm font-semibold text-foreground">{med.name}</span>
                                            <span className="text-xs text-muted-foreground">{med.dosage} · {med.frequency}</span>
                                        </div>
                                    ))}
                                </div>

                                {rx.notes && (
                                    <p className="text-xs text-muted-foreground bg-muted/30 rounded-xl px-3 py-2 border border-border mb-3">
                                        Note: {rx.notes}
                                    </p>
                                )}

                                {isPending && (
                                    fillConfirm === rx.id ? (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={async () => {
                                                    await fillPrescription.mutateAsync(rx.id)
                                                    setFillConfirm(null)
                                                }}
                                                disabled={fillPrescription.isPending}
                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-sky-500 text-white rounded-2xl text-sm font-bold hover:bg-sky-600 transition-all disabled:opacity-50"
                                            >
                                                {fillPrescription.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Tick02Icon className="w-4 h-4" />}
                                                Confirm Fill
                                            </button>
                                            <button
                                                onClick={() => setFillConfirm(null)}
                                                className="px-4 py-2.5 bg-muted text-muted-foreground rounded-2xl text-sm font-bold hover:bg-muted/80 transition-all"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setFillConfirm(rx.id)}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-2xl text-sm font-bold hover:bg-primary/90 transition-all"
                                        >
                                            <CheckmarkCircle01Icon className="w-4 h-4" />
                                            Fill This Prescription
                                        </button>
                                    )
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
