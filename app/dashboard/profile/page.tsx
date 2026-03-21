"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useProfile, useUpdateProfile, useAuditLogs } from "@/hooks/queries"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { PatientProfileUpdate } from "@/types"
import { useQueryClient } from "@tanstack/react-query"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { SingleImageDropzone } from "@/components/ui/single-image-dropzone"
import { useEdgeStore } from "@/lib/edgestore"
import { useAuth } from "@/hooks/use-auth"
import {
    UserIcon,
    CreditCardIcon,
    Clock01Icon,
    Settings01Icon,
    Logout01Icon,
    ArrowRight01Icon,
    ArrowLeft01Icon,
    Camera01Icon,
} from "hugeicons-react"
import { useRouter } from "next/navigation"

type Section = "menu" | "Personal Info" | "Activity Log" | "Payment Methods" | "Security & Settings"

export default function ProfilePage() {
    const { user, logout } = useAuth()
    const { data: profile, isPending } = useProfile()
    const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile()
    const queryClient = useQueryClient()
    const { edgestore } = useEdgeStore()
    const router = useRouter()

    const [file, setFile] = useState<File>()
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [section, setSection] = useState<Section>("menu")

    const { data: auditLogs, isPending: isLoadingLogs } = useAuditLogs()

    const { register, handleSubmit, setValue, reset, watch } = useForm<PatientProfileUpdate>()
    const gender = watch("gender")
    const bloodGroup = watch("blood_group")

    useEffect(() => {
        if (profile) {
            reset({
                full_name: profile.full_name,
                phone_number: profile.phone_number,
                date_of_birth: profile.date_of_birth,
                gender: profile.gender,
                blood_group: profile.blood_group,
                address: profile.address,
                city: profile.city
            })
        }
    }, [profile, reset])

    const onSubmit = async (data: PatientProfileUpdate) => {
        updateProfile({
            ...data,
            avatar_url: profile?.avatar_url
        }, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['profile'] })
            }
        })
    }

    const handlePhotoChange = async (newFile?: File) => {
        setFile(newFile)
        if (!newFile) return

        setIsUploadingPhoto(true)
        setUploadProgress(0)
        try {
            const res = await edgestore.publicFiles.upload({
                file: newFile,
                onProgressChange: (progress) => {
                    setUploadProgress(progress)
                },
            })
            updateProfile({ avatar_url: res.url }, {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['profile'] })
                    setFile(undefined)
                }
            })
        } catch (err) {
            console.error("Failed to upload photo:", err)
        } finally {
            setIsUploadingPhoto(false)
        }
    }

    const handleLogout = () => {
        logout()
        router.push("/login")
    }

    const displayName = profile?.full_name || user?.email?.split("@")[0] || "User"
    const displayEmail = user?.email || user?.phone_number || ""
    const initials = displayName?.[0]?.toUpperCase() || "U"

    // ───────────────────────────────────────
    // DESKTOP LAYOUT (md and up)
    // ───────────────────────────────────────
    const desktopLayout = (
        <div className="hidden md:block max-w-5xl mx-auto pb-12">
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
                <p className="text-sm text-muted-foreground mt-1">Manage your account settings and preferences.</p>
            </div>
            <div className="flex gap-8">
                {/* Sidebar */}
                <div className="w-72 shrink-0 space-y-6">
                    <div className="flex items-center gap-4 p-4 rounded-3xl bg-card border border-border">
                        <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center shrink-0 border border-primary/20 overflow-hidden">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-primary font-bold text-lg">{initials}</span>
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-sm text-foreground truncate">{displayName}</p>
                            <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        {([
                            { label: "Personal Info", icon: UserIcon },
                            { label: "Payment Methods", icon: CreditCardIcon },
                            { label: "Activity Log", icon: Clock01Icon },
                            { label: "Security & Settings", icon: Settings01Icon },
                        ] as { label: Section; icon: any }[]).map((item) => {
                            const isActive = section === item.label
                            return (
                                <button key={item.label} onClick={() => setSection(item.label)}
                                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all ${isActive ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-muted text-foreground font-medium'}`}>
                                    <div className="flex items-center gap-3">
                                        <item.icon className="w-5 h-5" fill={isActive ? "currentColor" : "none"} />
                                        <span className="text-[15px]">{item.label}</span>
                                    </div>
                                    {!isActive && <ArrowRight01Icon className="w-4 h-4 text-muted-foreground" />}
                                </button>
                            )
                        })}
                    </div>
                    <div className="pt-4 border-t border-border">
                        <button onClick={handleLogout} className="w-full flex items-center px-4 py-3.5 rounded-2xl hover:bg-destructive/10 text-destructive font-bold transition-all gap-3">
                            <Logout01Icon className="w-5 h-5" />
                            <span className="text-[15px]">Log out</span>
                        </button>
                    </div>
                </div>

                {/* Content pane */}
                <div className="flex-1">
                    <div className="bg-card border border-border rounded-[32px] p-8 min-h-[500px]">
                        {section === "Personal Info" && <PersonalInfoForm {...{ profile, isPending, isUpdating, isUploadingPhoto, uploadProgress, file, handlePhotoChange, handleSubmit, onSubmit, register, setValue, gender, bloodGroup }} />}
                        {section === "Activity Log" && <ActivityLogView auditLogs={auditLogs} isLoadingLogs={isLoadingLogs} />}
                        {(section === "Payment Methods" || section === "Security & Settings") && <ComingSoon />}
                    </div>
                </div>
            </div>
        </div>
    )

    // ───────────────────────────────────────
    // MOBILE LAYOUT — Native App Style
    // ───────────────────────────────────────

    // Mobile sub-page view with back button
    const mobileSubPage = (
        <div className="md:hidden">
            {/* Sub-page header */}
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setSection("menu")} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-foreground">
                    <ArrowLeft01Icon className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-bold text-foreground">{section}</h2>
            </div>

            {section === "Personal Info" && <PersonalInfoForm {...{ profile, isPending, isUpdating, isUploadingPhoto, uploadProgress, file, handlePhotoChange, handleSubmit, onSubmit, register, setValue, gender, bloodGroup }} />}
            {section === "Activity Log" && <ActivityLogView auditLogs={auditLogs} isLoadingLogs={isLoadingLogs} />}
            {(section === "Payment Methods" || section === "Security & Settings") && <ComingSoon />}
        </div>
    )

    // Mobile main menu view
    const mobileMenu = (
        <div className="md:hidden pb-4">
            {/* Profile Avatar Hero */}
            <div className="flex flex-col items-center pt-4 pb-8">
                <div className="relative mb-4">
                    <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/20 overflow-hidden flex items-center justify-center">
                        {profile?.avatar_url || file ? (
                            <img src={file ? URL.createObjectURL(file) : profile?.avatar_url!} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-3xl font-bold text-primary">{initials}</span>
                        )}
                    </div>
                    {/* Camera button */}
                    <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer shadow-md border-2 border-background">
                        <Camera01Icon className="w-4 h-4 text-white" />
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handlePhotoChange(e.target.files[0])} />
                    </label>
                    {isUploadingPhoto && (
                        <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                        </div>
                    )}
                </div>
                <h2 className="text-xl font-bold text-foreground">{displayName}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">{displayEmail}</p>
            </div>

            {/* Settings list rows */}
            <div className="space-y-2">
                {([
                    { label: "Personal Info", icon: UserIcon, desc: "Name, phone, date of birth" },
                    { label: "Payment Methods", icon: CreditCardIcon, desc: "Cards, billing info" },
                    { label: "Activity Log", icon: Clock01Icon, desc: "Recent account activity" },
                    { label: "Security & Settings", icon: Settings01Icon, desc: "Password, privacy" },
                ] as { label: Section; icon: any; desc: string }[]).map((item) => (
                    <button key={item.label} onClick={() => setSection(item.label)}
                        className="w-full flex items-center gap-4 px-4 py-4 bg-card rounded-2xl border border-border hover:bg-muted/40 transition-all text-left active:scale-[0.98]">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <item.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-foreground">{item.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                        </div>
                        <ArrowRight01Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                    </button>
                ))}
            </div>

            {/* Logout */}
            <div className="mt-4">
                <button onClick={handleLogout}
                    className="w-full flex items-center gap-4 px-4 py-4 bg-destructive/5 rounded-2xl border border-destructive/10 text-left active:scale-[0.98]">
                    <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                        <Logout01Icon className="w-5 h-5 text-destructive" />
                    </div>
                    <p className="font-semibold text-sm text-destructive">Log Out</p>
                </button>
            </div>
        </div>
    )

    return (
        <>
            {/* Desktop */}
            {desktopLayout}

            {/* Mobile */}
            {section === "menu" ? mobileMenu : mobileSubPage}
        </>
    )
}

// ──────────────────────────────────────────────────────────────
// Shared Sub-Components
// ──────────────────────────────────────────────────────────────

function PersonalInfoForm({ profile, isPending, isUpdating, isUploadingPhoto, uploadProgress, file, handlePhotoChange, handleSubmit, onSubmit, register, setValue, gender, bloodGroup }: any) {
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Avatar */}
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center pb-8 border-b border-border">
                <SingleImageDropzone
                    width={100}
                    height={100}
                    value={file || profile?.avatar_url}
                    onChange={handlePhotoChange}
                    className="rounded-full overflow-hidden border-2 border-dashed border-primary/40 hover:border-primary transition-colors bg-muted/50"
                />
                <div className="flex-1 space-y-1">
                    <h3 className="font-semibold text-sm text-foreground">Profile Photo</h3>
                    <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                        Upload a clear photo. Changes save instantly.
                    </p>
                    {isUploadingPhoto && (
                        <div className="w-full bg-muted rounded-full h-1.5 mt-3 max-w-xs overflow-hidden">
                            <div className="bg-primary h-full rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                        </div>
                    )}
                </div>
            </div>

            <div className="grid gap-5">
                <div className="grid gap-2">
                    <Label htmlFor="full_name" className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Full Name</Label>
                    <Input id="full_name" className="h-12 rounded-xl bg-muted/40 border-transparent focus-visible:bg-transparent focus-visible:ring-2 focus-visible:ring-primary shadow-sm" placeholder="Enter your full name" {...register("full_name")} disabled={isPending} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="grid gap-2">
                        <Label htmlFor="phone" className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Phone Number</Label>
                        <Input id="phone" className="h-12 rounded-xl bg-muted/40 border-transparent focus-visible:bg-transparent focus-visible:ring-2 focus-visible:ring-primary shadow-sm" placeholder="+234..." {...register("phone_number")} disabled={isPending} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="dob" className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Date of Birth</Label>
                        <Input id="dob" type="date" className="h-12 rounded-xl bg-muted/40 border-transparent focus-visible:bg-transparent focus-visible:ring-2 focus-visible:ring-primary shadow-sm" {...register("date_of_birth")} disabled={isPending} />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="grid gap-2">
                        <Label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Gender</Label>
                        <Select value={gender} onValueChange={(val) => setValue("gender", val)} disabled={isPending}>
                            <SelectTrigger className="h-12 rounded-xl bg-muted/40 border-transparent focus-visible:ring-2 focus-visible:ring-primary shadow-sm">
                                <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Blood Group</Label>
                        <Select value={bloodGroup} onValueChange={(val) => setValue("blood_group", val)} disabled={isPending}>
                            <SelectTrigger className="h-12 rounded-xl bg-muted/40 border-transparent focus-visible:ring-2 focus-visible:ring-primary shadow-sm">
                                <SelectValue placeholder="Select group" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(g => (
                                    <SelectItem key={g} value={g}>{g}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="address" className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Home Address</Label>
                    <Input id="address" className="h-12 rounded-xl bg-muted/40 border-transparent focus-visible:bg-transparent focus-visible:ring-2 focus-visible:ring-primary shadow-sm" placeholder="123 Main St" {...register("address")} disabled={isPending} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="city" className="text-muted-foreground text-xs font-bold uppercase tracking-wider">City</Label>
                    <Input id="city" className="h-12 rounded-xl bg-muted/40 border-transparent focus-visible:bg-transparent focus-visible:ring-2 focus-visible:ring-primary shadow-sm" placeholder="Lagos" {...register("city")} disabled={isPending} />
                </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-border mt-8">
                <Button type="submit" size="lg" className="rounded-xl px-8 w-full sm:w-auto font-bold h-12 shadow-md hover:shadow-lg transition-all" disabled={isUpdating || isUploadingPhoto || isPending}>
                    {(isUpdating || isUploadingPhoto) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </div>
        </form>
    )
}

function ActivityLogView({ auditLogs, isLoadingLogs }: { auditLogs: any; isLoadingLogs: boolean }) {
    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-foreground">Activity Log</h2>
                <p className="text-sm text-muted-foreground mt-1">Your recent account activities.</p>
            </div>
            {isLoadingLogs ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : !auditLogs?.length ? (
                <div className="text-center py-20 text-muted-foreground">
                    <Clock01Icon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>No recent activity found.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {auditLogs.map((log: any) => (
                        <div key={log.id} className="flex gap-4 p-4 rounded-2xl bg-muted/40 border border-transparent hover:border-border transition-all">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <Clock01Icon className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-foreground">{log.action_type.replace(/_/g, " ")}</p>
                                <p className="text-[13px] text-muted-foreground mt-0.5">{log.description}</p>
                                <p className="text-xs text-muted-foreground/60 mt-2">
                                    {new Date(log.created_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

function ComingSoon() {
    return (
        <div className="text-center py-20">
            <Settings01Icon className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-lg font-bold text-foreground">Coming Soon</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-2">
                This feature is currently under development. Stay tuned!
            </p>
        </div>
    )
}
