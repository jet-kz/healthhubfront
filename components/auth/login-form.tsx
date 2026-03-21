"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"


import { Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle   } from "../ui/card"
import { Alert, AlertDescription } from "../ui/alert"

const loginSchema = z.object({
    identifier: z.string().min(1, "Email or phone is required"),
    password: z.string().min(1, "Password is required"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
    const { login, isLoggingIn, loginError } = useAuth()

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            identifier: "",
            password: "",
        },
    })

    const onSubmit = (data: LoginFormValues) => {
        login(data)
    }

    // Helper to extract error message
    const getErrorMessage = (error: any) => {
        if (!error) return null;
        if (typeof error === 'string') return error;
        if (error.response?.data?.detail) {
            const detail = error.response.data.detail;
            if (typeof detail === 'string') return detail;
            return "Login failed. Please check your credentials.";
        }
        return error.message || "An unexpected error occurred";
    }


    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">Sign in</CardTitle>
                <CardDescription className="text-center">
                    Enter your email/phone and password to access your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {loginError && (
                        <Alert variant="destructive">
                            <AlertDescription>{getErrorMessage(loginError)}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="identifier">Email or Phone</Label>
                        <Input
                            id="identifier"
                            placeholder="user@example.com"
                            {...form.register("identifier")}
                        />
                        {form.formState.errors.identifier && (
                            <p className="text-sm text-red-500">{form.formState.errors.identifier.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            {...form.register("password")}
                        />
                        {form.formState.errors.password && (
                            <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
                        )}
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoggingIn}>
                        {isLoggingIn ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
                <a href="/forgot-password" className="hover:text-primary hover:underline">
                    Forgot your password?
                </a>
                <div>
                    Don&apos;t have an account?{" "}
                    <a href="/signup" className="text-primary hover:underline font-medium">
                        Sign up
                    </a>
                </div>
            </CardFooter>
        </Card>
    )
}
