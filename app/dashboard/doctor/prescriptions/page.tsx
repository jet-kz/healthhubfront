"use client"

import { useState } from "react"
import { usePrescriptions, useCreatePrescription, useDoctorPatients } from "@/hooks/queries"
import {
    Medicine01Icon, Add01Icon, Cancel01Icon,
    Tick02Icon, Clock05Icon, CheckmarkCircle01Icon
} from "hugeicons-react"
import { Loader2 } from "lucide-react"

const statusConfig: Record<string, { label: string; className: string }> = {
    pending: { label: "Pending", className: "bg-amber-100 text-amber-700 border-amber-200" },
    filled: { label: "Filled", className: "bg-green-100 text-green-700 border-green-200" },
    expired: { label: "Expired", className: "bg-red-100 text-red-700 border-red-200" },
}

interface Medication {
    name: string
    dosage: string
    frequency: string
}

export default function DoctorPrescriptionsPage() {
    const { data: prescriptions, isLoading } = usePrescriptions()
    const { data: patients } = useDoctorPatients()
    const createPrescription = useCreatePrescription()

    const [showModal, setShowModal] = useState(false)
    const [patientId, setPatientId] = useState("")
    const [notes, setNotes] = useState("")
    const [expiryDate, setExpiryDate] = useState("")
    const [medications, setMedications] = useState<Medication[]>([{ name: "", dosage: "", frequency: "" }])
    const [error, setError] = useState("")

    const addMed = () => setMedications(m => [...m, { name: "", dosage: "", frequency: "" }])
    const removeMed = (i: number) => setMedications(m => m.filter((_, idx) => idx !== i))
    const updateMed = (i: number, field: keyof Medication, val: string) => {
        setMedications(m => m.map((med, idx) => idx === i ? { ...med, [field]: val } : med))
    }

    const handleSubmit = async () => {
        setError("")
        if (!patientId) { setError("Select a patient"); return }
        if (!medications[0].name) { setError("Add at least one medication"); return }

        try {
            await createPrescription.mutateAsync({
                patient_id: Number(patientId),
                medications,
                notes: notes || undefined,
                expiry_date: expiryDate || undefined,
            })
            setShowModal(false)
            setPatientId(""); setNotes(""); setExpiryDate("")
            setMedications([{ name: "", dosage: "", frequency: "" }])
        } catch (e: any) {
            setError(e?.response?.data?.detail || "Failed to create prescription")
        }
    }

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Prescriptions</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {prescriptions?.length || 0} issued
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-2xl text-sm font-bold hover:bg-primary/90 transition-all active:scale-95 shadow-sm"
                >
                    <Add01Icon className="w-4 h-4" />
                    New Rx
                </button>
            </div>

            {/* List */}
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
            ) : (prescriptions || []).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Medicine01Icon className="w-14 h-14 text-muted-foreground/20 mb-4" />
                    <p className="font-bold text-foreground">No prescriptions yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Tap &quot;New Rx&quot; to issue your first prescription.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {(prescriptions || []).map((rx: any) => {
                        const status = rx.status?.toLowerCase() || "pending"
                        const cfg = statusConfig[status] || { label: status, className: "bg-muted text-muted-foreground" }
                        return (
                            <div key={rx.id} className="bg-card border border-border rounded-[24px] p-5 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <Medicine01Icon className="w-4 h-4 text-primary" fill="currentColor" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-foreground">Rx #{rx.prescription_code}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(rx.created_at || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border capitalize ${cfg.className}`}>
                                        {cfg.label}
                                    </span>
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
                                    <p className="text-xs text-muted-foreground bg-muted/30 rounded-xl px-3 py-2 border border-border">
                                        Note: {rx.notes}
                                    </p>
                                )}
                                {rx.expiry_date && (
                                    <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
                                        <Clock05Icon className="w-4 h-4 mr-1.5" /> Expires {new Date(rx.expiry_date).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Write Prescription Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-[28px] w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-5 border-b border-border">
                            <h2 className="font-bold text-lg text-foreground">Write Prescription</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80"
                            >
                                <Cancel01Icon className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            {/* Patient selector */}
                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Patient</label>
                                <select
                                    value={patientId}
                                    onChange={e => setPatientId(e.target.value)}
                                    className="w-full h-12 px-4 text-sm rounded-2xl bg-muted border border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="">Select patient…</option>
                                    {(patients || []).map((p: any) => (
                                        <option key={p.patient_id} value={p.patient_id}>{p.full_name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Medications */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Medications</label>
                                    <button onClick={addMed} className="text-xs text-primary font-bold flex items-center gap-1 hover:underline">
                                        <Add01Icon className="w-3.5 h-3.5" /> Add
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {medications.map((med, i) => (
                                        <div key={i} className="bg-muted/40 rounded-2xl p-3 border border-border space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-semibold text-muted-foreground">Med #{i + 1}</span>
                                                {i > 0 && (
                                                    <button onClick={() => removeMed(i)} className="text-red-500 hover:text-red-600">
                                                        <Cancel01Icon className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                            <input
                                                value={med.name} onChange={e => updateMed(i, "name", e.target.value)}
                                                placeholder="Drug name (e.g. Amoxicillin)"
                                                className="w-full h-10 px-3 text-sm rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    value={med.dosage} onChange={e => updateMed(i, "dosage", e.target.value)}
                                                    placeholder="Dosage (e.g. 500mg)"
                                                    className="h-10 px-3 text-sm rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                                />
                                                <input
                                                    value={med.frequency} onChange={e => updateMed(i, "frequency", e.target.value)}
                                                    placeholder="Frequency (e.g. 3x daily)"
                                                    className="h-10 px-3 text-sm rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Notes (optional)</label>
                                <textarea
                                    value={notes} onChange={e => setNotes(e.target.value)}
                                    placeholder="Additional instructions for the patient…"
                                    rows={3}
                                    className="w-full px-4 py-3 text-sm rounded-2xl bg-muted border border-transparent focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                />
                            </div>

                            {/* Expiry */}
                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Expiry Date (optional)</label>
                                <input
                                    type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)}
                                    className="w-full h-12 px-4 text-sm rounded-2xl bg-muted border border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            {error && <p className="text-sm text-destructive font-medium">{error}</p>}

                            <button
                                onClick={handleSubmit}
                                disabled={createPrescription.isPending}
                                className="w-full py-3.5 bg-primary text-white rounded-2xl font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {createPrescription.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Tick02Icon className="w-4 h-4" />}
                                Issue Prescription
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
