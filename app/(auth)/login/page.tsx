"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAuth } from "@/hooks/use-auth"
import { Loader2, Eye, EyeOff, Heart, AlertCircle } from "lucide-react"
import Link from "next/link"

const loginSchema = z.object({
    identifier: z.string().min(1, "Please enter your email or phone number"),
    password: z.string().min(1, "Please enter your password"),
})

type LoginFormValues = z.infer<typeof loginSchema>

// Translates any server/network error into a clear, human-readable message
function getFriendlyError(error: any): string {
    if (!error) return ""

    // Network / connection issue
    if (error.code === "ERR_NETWORK" || error.message === "Network Error" || !error.response) {
        return "Can't connect to the server. Please check your internet connection and try again."
    }

    const status = error.response?.status
    const detail = error.response?.data?.detail

    switch (status) {
        case 400:
            if (typeof detail === "string") return detail
            return "The information you entered is incorrect. Please check and try again."
        case 401:
            return "Incorrect email/phone or password. Please try again."
        case 403:
            return "Your account doesn't have access. Please contact support."
        case 404:
            return "No account found with that email or phone number. Please sign up first."
        case 422:
            if (Array.isArray(detail)) return detail.map((e: any) => e.msg).join(". ")
            return "Please check your email/phone and password format."
        case 429:
            return "Too many login attempts. Please wait a few minutes before trying again."
        case 500:
        case 502:
        case 503:
            return "The server is experiencing issues. Please try again in a moment."
        default:
            if (typeof detail === "string") return detail
            return "Something went wrong. Please try again."
    }
}

export default function LoginPage() {
    const { login, isLoggingIn, loginError } = useAuth()
    const [showPassword, setShowPassword] = useState(false)

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { identifier: "", password: "" },
    })

    const onSubmit = (data: LoginFormValues) => login(data)

    const errorMessage = getFriendlyError(loginError)

    return (
        <div className="min-h-screen bg-background flex">
            {/* Left panel – decorative (desktop only) */}
            <div className="hidden lg:flex lg:w-[45%] bg-primary relative overflow-hidden flex-col justify-between p-12">
                {/* Pattern overlay */}
                <div className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px),
                                          radial-gradient(circle at 75% 75%, white 1px, transparent 1px)`,
                        backgroundSize: "40px 40px"
                    }}
                />
                {/* Decorative circles */}
                <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10" />
                <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-white/10" />

                {/* Logo */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center">
                        <Heart className="w-5 h-5 text-primary fill-primary" />
                    </div>
                    <span className="text-white text-xl font-bold tracking-tight">JetCare</span>
                </div>

                {/* Hero text */}
                <div className="relative z-10 space-y-6">
                    <div className="space-y-3">
                        <h2 className="text-white text-4xl font-bold leading-tight">
                            Your health,<br />our priority.
                        </h2>
                        <p className="text-white/75 text-lg leading-relaxed">
                            Find doctors, book appointments, and manage your health records — all in one place.
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { value: "2,400+", label: "Doctors" },
                            { value: "1,200+", label: "Labs" },
                            { value: "850+", label: "Pharmacies" },
                        ].map((s) => (
                            <div key={s.label} className="bg-white/15 rounded-2xl p-4 backdrop-blur-sm">
                                <p className="text-white text-2xl font-bold">{s.value}</p>
                                <p className="text-white/70 text-sm mt-1">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom tag */}
                <p className="relative z-10 text-white/50 text-sm">
                    Trusted by thousands across Nigeria
                </p>
            </div>

            {/* Right panel – form */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
                <div className="w-full max-w-[420px] space-y-8">

                    {/* Mobile logo */}
                    <div className="flex lg:hidden items-center gap-2 justify-center">
                        <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
                            <Heart className="w-4 h-4 text-white fill-white" />
                        </div>
                        <span className="text-foreground text-lg font-bold">JetCare</span>
                    </div>

                    {/* Heading */}
                    <div className="space-y-1.5">
                        <h1 className="text-2xl font-bold text-foreground tracking-tight">Welcome back</h1>
                        <p className="text-muted-foreground text-sm">Sign in to your JetCare account</p>
                    </div>

                    {/* Error banner */}
                    {errorMessage && (
                        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                            <p className="text-sm leading-relaxed">{errorMessage}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Email / Phone */}
                        <div className="space-y-1.5">
                            <label htmlFor="identifier" className="text-sm font-medium text-foreground">
                                Email or Phone Number
                            </label>
                            <input
                                id="identifier"
                                type="text"
                                placeholder="you@example.com or +234..."
                                autoComplete="username"
                                {...form.register("identifier")}
                                className={`
                                    w-full h-12 px-4 rounded-xl border bg-white text-sm
                                    placeholder:text-muted-foreground/60
                                    focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                                    transition-all duration-150
                                    ${form.formState.errors.identifier
                                        ? "border-red-400 focus:ring-red-200 focus:border-red-400"
                                        : "border-border"
                                    }
                                `}
                            />
                            {form.formState.errors.identifier && (
                                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {form.formState.errors.identifier.message}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="text-sm font-medium text-foreground">
                                    Password
                                </label>
                                <a href="/forgot-password"
                                    className="text-xs text-primary hover:underline font-medium">
                                    Forgot password?
                                </a>
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    {...form.register("password")}
                                    className={`
                                        w-full h-12 px-4 pr-12 rounded-xl border bg-white text-sm
                                        placeholder:text-muted-foreground/60
                                        focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                                        transition-all duration-150
                                        ${form.formState.errors.password
                                            ? "border-red-400 focus:ring-red-200 focus:border-red-400"
                                            : "border-border"
                                        }
                                    `}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {form.formState.errors.password && (
                                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {form.formState.errors.password.message}
                                </p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoggingIn}
                            className="
                                w-full h-12 rounded-xl bg-primary text-white font-semibold text-sm
                                flex items-center justify-center gap-2
                                hover:bg-primary/90 active:scale-[0.98]
                                disabled:opacity-60 disabled:cursor-not-allowed
                                transition-all duration-150 pill-shadow
                                mt-2
                            "
                        >
                            {isLoggingIn ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-xs text-muted-foreground">or</span>
                        <div className="flex-1 h-px bg-border" />
                    </div>

                    {/* Sign up link */}
                    <p className="text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link href="/signup" className="text-primary font-semibold hover:underline">
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
