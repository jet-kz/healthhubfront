"use client"

import { usePrescriptions, useLabResults, usePatientRecords } from "@/hooks/queries"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UploadRecordDialog } from "@/components/records/upload-dialog"
import { Loader2, FileText, Beaker, Upload, File } from "lucide-react"
import { format } from "date-fns"

export default function RecordsPage() {
    const { data: prescriptions, isPending: loadingPrescriptions } = usePrescriptions()
    const { data: labResults, isPending: loadingLabs } = useLabResults()
    const { data: patientRecords, isPending: loadingRecords } = usePatientRecords()

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Medical Records</h1>
                    <p className="text-muted-foreground mt-1">
                        View your prescriptions, lab results, and uploaded documents.
                    </p>
                </div>
                <UploadRecordDialog>
                    <button className="flex items-center justify-center gap-2 bg-primary text-white font-semibold text-sm px-4 py-2.5 rounded-xl card-shadow hover:bg-primary/95 transition-all">
                        <Upload className="h-4 w-4" />
                        Upload Record
                    </button>
                </UploadRecordDialog>
            </div>

            <Tabs defaultValue="prescriptions" className="w-full">
                <TabsList className="bg-muted/50 p-1 rounded-2xl w-full sm:w-auto flex justify-start overflow-x-auto scrollbar-none mb-6">
                    <TabsTrigger 
                        value="prescriptions" 
                        className="rounded-xl data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:card-shadow flex-1 sm:flex-none"
                    >
                        Prescriptions
                    </TabsTrigger>
                    <TabsTrigger 
                        value="lab-results" 
                        className="rounded-xl data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:card-shadow flex-1 sm:flex-none"
                    >
                        Lab Results
                    </TabsTrigger>
                    <TabsTrigger 
                        value="my-uploads" 
                        className="rounded-xl data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:card-shadow flex-1 sm:flex-none"
                    >
                        My Uploads
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="prescriptions" className="space-y-4 focus-visible:outline-none focus-visible:ring-0">
                    {loadingPrescriptions ? (
                        <LoadingState />
                    ) : prescriptions && prescriptions.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {prescriptions.map((p) => (
                                <div key={p.id} className="bg-card border border-border rounded-3xl p-5 card-shadow flex flex-col hover:card-shadow-md transition-shadow">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                                            <FileText className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm text-foreground">
                                                Rx #{p.prescription_code?.substring(0, 6).toUpperCase() || p.id}
                                            </h3>
                                            <p className="text-xs font-medium text-muted-foreground">{format(new Date(), "MMM d, yyyy")}</p>
                                        </div>
                                        {p.status === "pending" && (
                                            <span className="ml-auto bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
                                                Pending
                                            </span>
                                        )}
                                    </div>
                                    <div className="bg-muted/30 rounded-2xl p-3 flex-1">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">Medications</span>
                                        <ul className="space-y-2">
                                            {p.medications.map((m: any, idx: number) => (
                                                <li key={idx} className="flex justify-between items-center text-sm">
                                                    <span className="font-semibold text-foreground truncate max-w-[140px]">{m.name}</span>
                                                    <span className="text-muted-foreground shrink-0 text-xs bg-card px-2 py-0.5 rounded-full border border-border">{m.dosage}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState message="You don't have any prescriptions." icon={FileText} colorClass="bg-blue-50 text-blue-500" />
                    )}
                </TabsContent>

                <TabsContent value="lab-results" className="space-y-4 focus-visible:outline-none focus-visible:ring-0">
                    {loadingLabs ? (
                        <LoadingState />
                    ) : labResults && labResults.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {labResults.map((r) => (
                                <div key={r.id} className="bg-card border border-border rounded-3xl p-5 card-shadow flex flex-col hover:card-shadow-md transition-shadow">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
                                            <Beaker className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm text-foreground truncate">{r.test_type}</h3>
                                            <p className="text-xs font-medium text-muted-foreground">Lab #{r.lab_id}</p>
                                        </div>
                                    </div>
                                    <div className="bg-muted/30 rounded-2xl p-3 mb-4 flex-1">
                                        <p className="text-sm text-foreground/80 leading-relaxed italic line-clamp-3">
                                            "{r.summary || "No summary provided."}"
                                        </p>
                                    </div>
                                    {r.full_report_url && (
                                        <a 
                                            href={r.full_report_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="block text-center w-full bg-primary/5 text-primary hover:bg-primary/10 font-semibold text-sm py-2.5 rounded-xl transition-colors mt-auto"
                                        >
                                            View Full Report
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState message="You don't have any lab results." icon={Beaker} colorClass="bg-purple-50 text-purple-500" />
                    )}
                </TabsContent>

                <TabsContent value="my-uploads" className="space-y-4 focus-visible:outline-none focus-visible:ring-0">
                    {loadingRecords ? (
                        <LoadingState />
                    ) : patientRecords && patientRecords.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {patientRecords.map((r) => (
                                <div key={r.id} className="bg-card border border-border rounded-3xl p-5 card-shadow flex flex-col hover:card-shadow-md transition-shadow">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                                            <File className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm text-foreground line-clamp-1">{r.title}</h3>
                                            <p className="text-xs font-medium text-muted-foreground">{format(new Date(r.created_at), "MMM d, yyyy")}</p>
                                        </div>
                                    </div>
                                    <div className="bg-muted/30 rounded-2xl p-3 mb-4 flex-1">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Type</span>
                                        <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded-lg mb-3">
                                            {r.document_type}
                                        </span>
                                        <p className="text-sm text-foreground/80 leading-relaxed line-clamp-2">
                                            {r.description || "No description provided."}
                                        </p>
                                    </div>
                                    <a 
                                        href={r.document_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="block text-center w-full bg-primary/5 text-primary hover:bg-primary/10 font-semibold text-sm py-2.5 rounded-xl transition-colors mt-auto"
                                    >
                                        View Document
                                    </a>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState message="You haven't uploaded any records yet." icon={Upload} colorClass="bg-primary/10 text-primary" />
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}

function LoadingState() {
    return (
        <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
}

function EmptyState({ message, icon: Icon, colorClass }: { message: string, icon: any, colorClass: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 bg-muted/30 border border-dashed border-border rounded-3xl max-w-2xl mx-auto">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${colorClass}`}>
                <Icon className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Empty File</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm text-center">{message}</p>
        </div>
    )
}
