"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAuth } from "@/hooks/use-auth"
import { Loader2, Eye, EyeOff, Heart, AlertCircle, User, Stethoscope, FlaskConical, Pill } from "lucide-react"
import Link from "next/link"
import { UserRole } from "@/types"

const signupSchema = z.object({
    full_name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    phone_number: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    role: z.nativeEnum(UserRole),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

type SignupFormValues = z.infer<typeof signupSchema>

function getFriendlyError(error: any): string {
    if (!error) return ""
    if (error.code === "ERR_NETWORK" || error.message === "Network Error" || !error.response) {
        return "Can't connect to the server. Please check your internet connection and try again."
    }
    const status = error.response?.status
    const detail = error.response?.data?.detail
    switch (status) {
        case 400:
            if (typeof detail === "string") return detail
            return "Please check your details and try again."
        case 409:
            return "An account with this email or phone already exists. Please sign in instead."
        case 422:
            if (Array.isArray(detail)) return detail.map((e: any) => e.msg).join(". ")
            return "Please fill in all required fields correctly."
        case 500: case 502: case 503:
            return "The server is experiencing issues. Please try again in a moment."
        default:
            if (typeof detail === "string") return detail
            return "Something went wrong. Please try again."
    }
}

const roleOptions = [
    { value: UserRole.PATIENT, label: "Patient", icon: User, desc: "Book appointments & manage records" },
    { value: UserRole.DOCTOR, label: "Doctor", icon: Stethoscope, desc: "Manage patients & appointments" },
    { value: UserRole.LAB, label: "Lab / Diagnostics", icon: FlaskConical, desc: "Upload & manage lab results" },
    { value: UserRole.PHARMACY, label: "Pharmacy", icon: Pill, desc: "Manage prescriptions" },
]

export default function SignupPage() {
    const { register: registerUser, isRegistering, registerError } = useAuth()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const form = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            full_name: "", email: "", phone_number: "",
            password: "", confirmPassword: "", role: UserRole.PATIENT,
        },
    })

    const selectedRole = form.watch("role")

    const onSubmit = (data: SignupFormValues) => {
        const { confirmPassword, ...payload } = data
        registerUser(payload)
    }

    const errorMessage = getFriendlyError(registerError)

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 sm:p-10">
            <div className="w-full max-w-[480px] space-y-7">

                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
                        <Heart className="w-4 h-4 text-white fill-white" />
                    </div>
                    <span className="text-foreground text-lg font-bold">JetCare</span>
                </div>

                {/* Heading */}
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">Create your account</h1>
                    <p className="text-muted-foreground text-sm">Join thousands managing their health on JetCare</p>
                </div>

                {/* Error banner */}
                {errorMessage && (
                    <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <p className="text-sm leading-relaxed">{errorMessage}</p>
                    </div>
                )}

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {/* Name */}
                    <div className="space-y-1.5">
                        <label htmlFor="full_name" className="text-sm font-medium text-foreground">Full Name</label>
                        <input
                            id="full_name"
                            type="text"
                            placeholder="John Doe"
                            autoComplete="name"
                            {...form.register("full_name")}
                            className={`w-full h-11 px-4 rounded-xl border bg-white text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${form.formState.errors.full_name ? "border-red-400" : "border-border"}`}
                        />
                        {form.formState.errors.full_name && (
                            <p className="text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />{form.formState.errors.full_name.message}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                        <label htmlFor="email" className="text-sm font-medium text-foreground">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            autoComplete="email"
                            {...form.register("email")}
                            className={`w-full h-11 px-4 rounded-xl border bg-white text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${form.formState.errors.email ? "border-red-400" : "border-border"}`}
                        />
                        {form.formState.errors.email && (
                            <p className="text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />{form.formState.errors.email.message}
                            </p>
                        )}
                    </div>

                    {/* Phone (optional) */}
                    <div className="space-y-1.5">
                        <label htmlFor="phone_number" className="text-sm font-medium text-foreground">
                            Phone Number <span className="text-muted-foreground font-normal">(optional)</span>
                        </label>
                        <input
                            id="phone_number"
                            type="tel"
                            placeholder="+234 800 000 0000"
                            autoComplete="tel"
                            {...form.register("phone_number")}
                            className="w-full h-11 px-4 rounded-xl border border-border bg-white text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                        />
                    </div>

                    {/* Role selector */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">I am signing up as a...</label>
                        <div className="grid grid-cols-2 gap-2">
                            {roleOptions.map(({ value, label, icon: Icon, desc }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => form.setValue("role", value)}
                                    className={`
                                        flex flex-col items-start gap-1.5 p-3 rounded-xl border-2 text-left transition-all
                                        ${selectedRole === value
                                            ? "border-primary bg-primary/5"
                                            : "border-border bg-white hover:border-primary/40"
                                        }
                                    `}
                                >
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${selectedRole === value ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                                        <Icon className="w-3.5 h-3.5" />
                                    </div>
                                    <div>
                                        <p className={`text-xs font-semibold ${selectedRole === value ? "text-primary" : "text-foreground"}`}>{label}</p>
                                        <p className="text-[10px] text-muted-foreground leading-tight">{desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Password */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Min. 6 characters"
                                    autoComplete="new-password"
                                    {...form.register("password")}
                                    className={`w-full h-11 px-4 pr-10 rounded-xl border bg-white text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${form.formState.errors.password ? "border-red-400" : "border-border"}`}
                                />
                                <button type="button" tabIndex={-1} onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {form.formState.errors.password && (
                                <p className="text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />{form.formState.errors.password.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">Confirm</label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    type={showConfirm ? "text" : "password"}
                                    placeholder="Repeat password"
                                    autoComplete="new-password"
                                    {...form.register("confirmPassword")}
                                    className={`w-full h-11 px-4 pr-10 rounded-xl border bg-white text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${form.formState.errors.confirmPassword ? "border-red-400" : "border-border"}`}
                                />
                                <button type="button" tabIndex={-1} onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {form.formState.errors.confirmPassword && (
                                <p className="text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />{form.formState.errors.confirmPassword.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isRegistering}
                        className="w-full h-12 rounded-xl bg-primary text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 pill-shadow mt-1"
                    >
                        {isRegistering ? (
                            <><Loader2 className="w-4 h-4 animate-spin" />Creating account...</>
                        ) : "Create Account"}
                    </button>
                </form>

                <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
                </p>
            </div>
        </div>
    )
}
