"use client"

import { useAuth } from "@/hooks/use-auth"
import { useAppointments, useProfile, useSearchProviders } from "@/hooks/queries"
import Link from "next/link"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import {
    StethoscopeIcon, Calendar01Icon, 
    ArrowRight01Icon, Location01Icon, StarIcon, 
    ArrowUpRight01Icon,
    Medicine01Icon, FavouriteIcon, CircleArrowUpRightIcon,
    Folder01Icon
} from "hugeicons-react"

import { ProviderProfileDialog } from "@/components/search/provider-profile-dialog"

export default function DashboardPage() {
    const { user, isLoading: authLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!authLoading && user) {
            const role = user.role?.toLowerCase()
            if (role === 'doctor') router.replace('/dashboard/doctor')
            else if (role === 'lab') router.replace('/dashboard/lab')
            else if (role === 'pharmacy') router.replace('/dashboard/pharmacy')
        }
    }, [user, authLoading, router])

    const { data: profile } = useProfile()
    const { data: appointments } = useAppointments()
    
    // Fetch top doctors and labs near default Lagos coordinates (seeded data location)
    const { data: doctors } = useSearchProviders({ latitude: 6.45, longitude: 3.4, radius_km: 50, type: "doctor" })
    const { data: labs } = useSearchProviders({ latitude: 6.45, longitude: 3.4, radius_km: 50, type: "lab" })
    const { data: pharmacies } = useSearchProviders({ latitude: 6.45, longitude: 3.4, radius_km: 50, type: "pharmacy" })

    // Slice for top 3
    const topDoctors = doctors?.slice(0, 3) || []
    const topFacilities = [...(labs || []), ...(pharmacies || [])].sort((a, b) => b.rating - a.rating).slice(0, 3)

    const hour = new Date().getHours()
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
    const firstName = profile?.full_name?.split(" ")[0] || user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "there"

    const today = new Date()
    const dateStr = today.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" })

    // Get next upcoming appointment
    const upcomingAppt = appointments?.[0]

    return (
        <div className="space-y-7 max-w-2xl mx-auto lg:max-w-none">

            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/profile" className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shrink-0 border-2 border-primary/20 overflow-hidden shadow-sm hover:scale-105 transition-transform active:scale-95">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-xl font-bold text-white">
                                {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                            </span>
                        )}
                    </Link>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-[-0.03em] text-foreground">
                            {greeting}, {firstName}.
                        </h1>
                        <p className="text-sm text-gray-500 font-medium mt-0.5">{dateStr}</p>
                    </div>
                </div>
                {/* Location chip */}
                <div className="flex items-center gap-1.5 text-xs text-gray-700 bg-gray-100 rounded-full px-3 py-1.5 mt-1">
                    <Location01Icon className="w-3.5 h-3.5" fill="currentColor" />
                    <span className="font-bold">Lagos, NG</span>
                </div>
            </div>

            {/* ── Quick Actions ── */}
            <div className="grid grid-cols-3 gap-3">
                {/* Book Doctor */}
                <Link
                    href="/dashboard/search?type=doctor"
                    className="relative flex flex-col justify-between p-4 rounded-[24px] overflow-hidden min-h-[130px] group transition-all active:scale-95"
                    style={{ background: "linear-gradient(135deg, #1a6fff 0%, #0d4fcf 100%)" }}
                >
                    <div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(circle at 80% 20%, white 0%, transparent 60%)" }} />
                    <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <StethoscopeIcon className="w-5 h-5 text-white" fill="currentColor" />
                    </div>
                    <div>
                        <p className="text-white font-bold text-[13px] leading-tight">Book</p>
                        <p className="text-white font-bold text-[13px] leading-tight">Doctor</p>
                        <p className="text-white/60 text-[10px] font-medium mt-1">Specialists & GPs</p>
                    </div>
                    <ArrowUpRight01Icon className="absolute top-3.5 right-3.5 w-4 h-4 text-white/50 group-hover:text-white/90 transition-colors" />
                </Link>

                {/* Book Service */}
                <Link
                    href="/dashboard/search?type=pharmacy"
                    className="relative flex flex-col justify-between p-4 rounded-[24px] overflow-hidden min-h-[130px] group transition-all active:scale-95"
                    style={{ background: "linear-gradient(135deg, #00b87a 0%, #007a52 100%)" }}
                >
                    <div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(circle at 80% 20%, white 0%, transparent 60%)" }} />
                    <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <Medicine01Icon className="w-5 h-5 text-white" fill="currentColor" />
                    </div>
                    <div>
                        <p className="text-white font-bold text-[13px] leading-tight">Book</p>
                        <p className="text-white font-bold text-[13px] leading-tight">Service</p>
                        <p className="text-white/60 text-[10px] font-medium mt-1">Pharmacy & Lab</p>
                    </div>
                    <ArrowUpRight01Icon className="absolute top-3.5 right-3.5 w-4 h-4 text-white/50 group-hover:text-white/90 transition-colors" />
                </Link>

                {/* Records */}
                <Link
                    href="/dashboard/records"
                    className="relative flex flex-col justify-between p-4 rounded-[24px] overflow-hidden min-h-[130px] group transition-all active:scale-95"
                    style={{ background: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)" }}
                >
                    <div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(circle at 80% 20%, white 0%, transparent 60%)" }} />
                    <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <Folder01Icon className="w-5 h-5 text-white" fill="currentColor" />
                    </div>
                    <div>
                        <p className="text-white font-bold text-[13px] leading-tight">My</p>
                        <p className="text-white font-bold text-[13px] leading-tight">Records</p>
                        <p className="text-white/60 text-[10px] font-medium mt-1">History & docs</p>
                    </div>
                    <ArrowUpRight01Icon className="absolute top-3.5 right-3.5 w-4 h-4 text-white/50 group-hover:text-white/90 transition-colors" />
                </Link>
            </div>

            {/* ── Upcoming Appointment ── */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base tracking-tight font-bold text-foreground">Upcoming Visit</h2>
                    <Link href="/dashboard/appointments" className="text-xs text-primary bg-primary/10 px-3 py-1.5 rounded-full font-semibold flex items-center gap-1 hover:bg-primary/20 transition-colors">
                        View all
                    </Link>
                </div>

                {upcomingAppt ? (
                    <div className="bg-card border border-border rounded-[24px] p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border">
                                <Calendar01Icon className="w-3.5 h-3.5 text-primary" />
                                <span>{new Date(upcomingAppt.appointment_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                                <span className="text-muted-foreground/30">•</span>
                                <span>{new Date(upcomingAppt.appointment_date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
                            </div>
                            <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                                {upcomingAppt.type || "Clinic"}
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-primary text-sm font-bold">
                                    {upcomingAppt.type === 'lab_test' ? 'Lab' : 'Dr'}
                                </span>
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-sm text-foreground">
                                    {upcomingAppt.notes || "Checkup Appointment"}
                                </p>
                                <p className="text-[13px] font-medium text-muted-foreground capitalize">{upcomingAppt.status}</p>
                            </div>
                            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/80 transition-all">
                                <CircleArrowUpRightIcon className="w-4 h-4" fill="currentColor" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-card border border-border rounded-[24px] p-6 shadow-sm flex flex-col items-center justify-center text-center gap-3">
                        <div className="w-14 h-14 bg-muted/50 rounded-full flex items-center justify-center border border-border">
                            <Calendar01Icon className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="font-bold text-[15px] text-foreground">No appointments yet</p>
                            <p className="text-[13px] text-muted-foreground mt-1 max-w-[200px] mx-auto">Book a session with a practitioner near you.</p>
                        </div>
                        <Link
                            href="/dashboard/search"
                            className="text-[13px] font-bold bg-primary text-primary-foreground px-5 py-2.5 rounded-full mt-2 hover:bg-primary/80 transition-all shadow-sm"
                        >
                            Book now
                        </Link>
                    </div>
                )}
            </div>

            {/* ── Top Doctors ── */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-bold tracking-tight text-foreground">Top Doctors</h2>
                    <Link href="/dashboard/search?type=doctor" className="text-xs text-primary font-semibold flex items-center gap-1 hover:text-primary/80 transition-colors">
                        View directory <ArrowRight01Icon className="w-3 h-3" />
                    </Link>
                </div>

                <div className="flex flex-col gap-3">
                    {topDoctors.length > 0 ? topDoctors.map((doc, i) => (
                        <ProviderProfileDialog key={doc.id} provider={doc}>
                            <div className="flex items-center p-3 bg-card border border-border rounded-[20px] shadow-sm hover:border-primary/20 hover:shadow-md transition-all cursor-pointer group">
                                {/* Photo area */}
                                {doc.avatar_url ? (
                                    <img src={doc.avatar_url} alt={doc.name} className="w-14 h-14 rounded-full mr-4 border border-border shrink-0 object-cover" />
                                ) : (
                                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mr-4 border border-border shrink-0">
                                        <span className="text-lg font-bold text-primary">{doc.name.charAt(0)}</span>
                                    </div>
                                )}

                                {/* Info */}
                                <div className="flex-1 min-w-0 text-left">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-bold text-foreground truncate leading-tight">{doc.name}</p>
                                        <span className="w-2 h-2 rounded-full bg-primary shrink-0" title="Available now" />
                                    </div>
                                    <p className="text-[13px] text-muted-foreground mt-0.5 max-w-[200px] truncate">{doc.bio || "General Practitioner"}</p>
                                    <div className="flex items-center gap-1.5 mt-1.5">
                                        <StarIcon className="w-3.5 h-3.5 text-primary" fill="currentColor" />
                                        <span className="text-[12px] font-bold text-foreground">{doc.rating}</span>
                                    </div>
                                </div>

                                <button className="w-9 h-9 flex items-center justify-center bg-muted hover:bg-primary hover:text-white rounded-full border border-border text-muted-foreground ml-2 shrink-0 transition-colors">
                                    <ArrowRight01Icon className="w-4 h-4" />
                                </button>
                            </div>
                        </ProviderProfileDialog>
                    )) : (
                        <p className="text-sm text-muted-foreground py-4 text-center border rounded-2xl border-dashed">No doctors found.</p>
                    )}
                </div>
            </div>

            {/* ── Top Facilities ── */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-bold tracking-tight text-foreground">Featured Services & Labs</h2>
                    <Link href="/dashboard/search?type=lab" className="text-xs text-primary font-semibold flex items-center gap-1 hover:text-primary/80 transition-colors">
                        View directory <ArrowRight01Icon className="w-3 h-3" />
                    </Link>
                </div>

                <div className="flex flex-col gap-3">
                    {topFacilities.length > 0 ? topFacilities.map((fac, i) => (
                        <ProviderProfileDialog key={fac.id} provider={fac}>
                            <div className="flex items-center p-3 bg-card border border-border rounded-[20px] shadow-sm hover:border-primary/20 hover:shadow-md transition-all cursor-pointer group">
                                {fac.avatar_url ? (
                                    <img src={fac.avatar_url} alt={fac.name} className="w-14 h-14 rounded-full mr-4 border border-border shrink-0 object-cover" />
                                ) : (
                                    <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mr-4 border border-border shrink-0">
                                        <Medicine01Icon className="w-6 h-6" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0 text-left">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-bold text-foreground truncate leading-tight">{fac.name}</p>
                                    </div>
                                    <p className="text-[13px] text-muted-foreground mt-0.5 capitalize">{fac.type}</p>
                                    <div className="flex items-center gap-1.5 mt-1.5">
                                        <StarIcon className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" />
                                        <span className="text-[12px] font-bold text-foreground">{fac.rating}</span>
                                    </div>
                                </div>
                                <button className="w-9 h-9 flex items-center justify-center bg-muted hover:bg-emerald-500 hover:text-white rounded-full border border-border text-muted-foreground ml-2 shrink-0 transition-colors">
                                    <ArrowRight01Icon className="w-4 h-4" />
                                </button>
                            </div>
                        </ProviderProfileDialog>
                    )) : null}
                </div>
            </div>

        </div>
    )
}
