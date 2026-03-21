"use client"

import { useState } from "react"
import { useLabResults, useUploadLabResult } from "@/hooks/queries"
import { 
    TestTube01Icon, Add01Icon, Cancel01Icon, 
    Tick02Icon, FileEditIcon,
    Building01Icon, UserIcon, ArrowRight01Icon,
    File01Icon, InformationCircleIcon
} from "hugeicons-react"
import { Loader2 } from "lucide-react"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function LabResultsPage() {
    const { data: results, isLoading } = useLabResults()
    const uploadResult = useUploadLabResult()
    
    // Modal State
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
    const [manualForm, setManualForm] = useState({
        patient_id: "",
        test_type: "",
        summary: "",
        full_report_url: ""
    })

    const handleManualUpload = () => {
        if (!manualForm.patient_id || !manualForm.test_type) return
        
        uploadResult.mutate({
            patient_id: parseInt(manualForm.patient_id),
            test_type: manualForm.test_type,
            summary: manualForm.summary,
            full_report_url: manualForm.full_report_url
        }, {
            onSuccess: () => {
                setIsUploadModalOpen(false)
                setManualForm({ patient_id: "", test_type: "", summary: "", full_report_url: "" })
            }
        })
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-muted-foreground font-medium">Loading history...</p>
            </div>
        )
    }

    return (
        <div className="space-y-7 max-w-4xl mx-auto">
            {/* ── Header Banner ── */}
            <div
                className="relative rounded-[28px] overflow-hidden p-6 shadow-md"
                style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%)" }}
            >
                <div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(circle at 90% 10%, white 0%, transparent 60%)" }} />
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <p className="text-white/70 text-sm font-medium">Digital Records</p>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">Lab Results</h1>
                        <p className="text-white/60 text-[13px] font-medium mt-1.5 flex items-center gap-1.5">
                            <File01Icon className="w-3.5 h-3.5" /> Total {results?.length || 0} reports released
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between px-1">
                <h2 className="text-lg font-bold tracking-tight text-foreground">Recently Released</h2>
                <Button onClick={() => setIsUploadModalOpen(true)} size="sm" className="rounded-full font-bold">
                    <Add01Icon className="w-4 h-4 mr-2" /> Manual Upload
                </Button>
            </div>

            <div className="grid gap-4">
                {results?.map((r: any) => (
                    <div key={r.id} className="bg-white border border-gray-100 rounded-[28px] p-6 shadow-sm hover:border-sky-100 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-sky-50 flex items-center justify-center shrink-0 border border-sky-100 group-hover:scale-110 transition-transform">
                                <TestTube01Icon className="w-7 h-7 text-sky-600" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-bold text-lg text-foreground">Patient #{r.patient_id}</p>
                                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">ID RECORD</span>
                                </div>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-sm font-bold text-primary bg-primary/5 px-2.5 py-0.5 rounded-lg capitalize">{r.test_type}</span>
                                    <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 border-l pl-3">
                                        <Clock01Icon className="w-3 h-3" /> Released {format(new Date(), "MMM d, yyyy")}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 self-end md:self-center">
                            {r.full_report_url && (
                                <a 
                                    href={r.full_report_url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="h-11 px-6 rounded-2xl bg-slate-50 text-slate-700 font-bold text-sm flex items-center gap-2 hover:bg-slate-100 transition-colors border border-slate-100"
                                >
                                    <File01Icon className="w-4 h-4" /> View Report
                                </a>
                            )}
                        </div>
                    </div>
                ))}

                {results?.length === 0 && (
                    <div className="bg-gray-50 rounded-[40px] p-20 text-center border-2 border-dashed border-gray-200">
                        <File01Icon className="w-16 h-16 mx-auto text-gray-200 mb-4" />
                        <h3 className="text-xl font-bold text-gray-400">No results found</h3>
                        <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">Digitally recorded test results will appear here once processed.</p>
                    </div>
                )}
            </div>

            {/* Manual Upload Modal (Simplified Revert) */}
            <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
                <DialogContent className="max-w-md rounded-[32px]">
                    <DialogHeader>
                        <DialogTitle>Manual Result Entry</DialogTitle>
                        <DialogDescription>Quickly record a test result for a patient.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="space-y-1">
                            <Label>Patient ID</Label>
                            <Input value={manualForm.patient_id} onChange={e => setManualForm({...manualForm, patient_id: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                            <Label>Test Title</Label>
                            <Input value={manualForm.test_type} onChange={e => setManualForm({...manualForm, test_type: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                            <Label>Report URL</Label>
                            <Input value={manualForm.full_report_url} onChange={e => setManualForm({...manualForm, full_report_url: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                            <Label>Summary</Label>
                            <Textarea value={manualForm.summary} onChange={e => setManualForm({...manualForm, summary: e.target.value})} />
                        </div>
                        <Button onClick={handleManualUpload} className="w-full" disabled={uploadResult.isPending}>Save Result</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function Clock01Icon(props: any) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
            <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 7v5l3 3m6-3a9 9 0 1 1-18 0a9 9 0 0 1 18 0" />
        </svg>
    )
}
