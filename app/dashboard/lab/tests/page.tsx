"use client"

import { useState } from "react"
import { useLabProfile, useUpdateLabProfile } from "@/hooks/queries"
import { useAuth } from "@/hooks/use-auth"
import { 
    TestTube01Icon, Add01Icon, Delete02Icon, 
    InformationCircleIcon, Tick02Icon, 
    Building01Icon
} from "hugeicons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"

export default function LabTestsPage() {
    const { user } = useAuth()
    const { data: profile, isLoading } = useLabProfile()
    const { mutate: updateProfile, isPending: isUpdating } = useUpdateLabProfile()
    const queryClient = useQueryClient()

    const [newTestName, setNewTestName] = useState("")
    const [newTestPrice, setNewTestPrice] = useState("")
    const [isAdding, setIsAdding] = useState(false)

    const tests = profile?.services_offered || []

    const handleAddTest = () => {
        if (!newTestName || !newTestPrice) return

        const updatedServices = [
            ...tests,
            { name: newTestName, price: parseFloat(newTestPrice) }
        ]

        updateProfile({ services_offered: updatedServices }, {
            onSuccess: () => {
                setNewTestName("")
                setNewTestPrice("")
                setIsAdding(false)
                queryClient.invalidateQueries({ queryKey: ['lab-profile'] })
            }
        })
    }

    const handleRemoveTest = (index: number) => {
        const updatedServices = tests.filter((_: any, i: number) => i !== index)
        updateProfile({ services_offered: updatedServices }, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['lab-profile'] })
            }
        })
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-muted-foreground font-medium">Loading catalog...</p>
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
                        <p className="text-white/70 text-sm font-medium">Manage Services</p>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">Tests Catalog</h1>
                        <p className="text-white/60 text-[13px] font-medium mt-1.5 flex items-center gap-1.5">
                            <TestTube01Icon className="w-3.5 h-3.5" /> {tests.length} active service{tests.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_320px] gap-8">
                {/* ── Main Catalog ── */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-lg font-bold tracking-tight text-foreground">Available Tests</h2>
                        <button 
                            onClick={() => setIsAdding(!isAdding)}
                            className="lg:hidden text-primary font-bold text-sm flex items-center gap-1"
                        >
                            {isAdding ? "Close Form" : "Add New Test"}
                        </button>
                    </div>

                    {tests.length === 0 ? (
                        <div className="bg-white rounded-[32px] p-12 text-center border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-sky-50 flex items-center justify-center">
                                <TestTube01Icon className="w-10 h-10 text-sky-400" />
                            </div>
                            <div className="max-w-xs">
                                <h3 className="font-bold text-lg text-foreground">Your catalog is empty</h3>
                                <p className="text-sm text-muted-foreground mt-1">Add tests like Malaria, Typhoid, or Blood Count to start receiving bookings.</p>
                            </div>
                            <Button onClick={() => setIsAdding(true)} className="rounded-full font-bold mt-2">
                                <Add01Icon className="w-4 h-4 mr-2" /> Create First Test
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {tests.map((test: any, i: number) => (
                                <div key={i} className="bg-white border border-gray-100 rounded-[24px] p-5 shadow-sm flex items-center justify-between gap-4 hover:border-sky-100/80 hover:shadow-md transition-all group">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center shrink-0">
                                            <Tick02Icon className="w-6 h-6 text-sky-600" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-base text-foreground truncate">{test.name}</p>
                                            <p className="text-xs text-muted-foreground font-medium">Lab Test Service</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 shrink-0">
                                        <div className="text-right">
                                            <p className="text-lg font-black text-primary">₦{test.price?.toLocaleString()}</p>
                                        </div>
                                        <button 
                                            onClick={() => handleRemoveTest(i)}
                                            className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:bg-rose-50 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Delete02Icon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Add New Test Column ── */}
                <div className={`${isAdding ? 'block' : 'hidden lg:block'} space-y-6`}>
                    <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm sticky top-6">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                                <Add01Icon className="w-4 h-4 text-emerald-600" />
                            </div>
                            <h2 className="font-bold text-foreground">Add New Service</h2>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Test Name</Label>
                                <Input 
                                    placeholder="e.g. Malaria Parasite" 
                                    className="rounded-2xl h-12 border-gray-100 focus:ring-primary bg-muted/30"
                                    value={newTestName}
                                    onChange={(e) => setNewTestName(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Price (₦)</Label>
                                <Input 
                                    type="number"
                                    placeholder="e.g. 5000" 
                                    className="rounded-2xl h-12 border-gray-100 focus:ring-primary bg-muted/30"
                                    value={newTestPrice}
                                    onChange={(e) => setNewTestPrice(e.target.value)}
                                />
                            </div>

                            <div className="bg-sky-50 rounded-2xl p-4 flex gap-3 border border-sky-100/50">
                                <InformationCircleIcon className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                                <p className="text-[11px] leading-relaxed text-sky-800 font-medium">
                                    Prices should be inclusive of all service fees. Make sure the name is clear for patients.
                                </p>
                            </div>

                            <Button 
                                onClick={handleAddTest}
                                disabled={!newTestName || !newTestPrice || isUpdating}
                                className="w-full h-12 rounded-2xl font-bold text-[15px] shadow-lg shadow-primary/20"
                            >
                                {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save to Catalog"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Spacer for bottom nav on mobile */}
            <div className="h-20 lg:hidden"></div>
        </div>
    )
}
