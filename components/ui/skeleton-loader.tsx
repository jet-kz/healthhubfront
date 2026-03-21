import { cn } from "@/lib/utils"

interface SkeletonProps {
    className?: string
    variant?: "default" | "card" | "text" | "avatar" | "button"
}

const variantClasses = {
    default: "h-4 w-full rounded",
    card: "h-32 w-full rounded-lg",
    text: "h-4 w-3/4 rounded",
    avatar: "h-12 w-12 rounded-full",
    button: "h-10 w-24 rounded-md",
}

export function Skeleton({ className, variant = "default" }: SkeletonProps) {
    return (
        <div
            className={cn(
                "animate-pulse bg-muted/50",
                variantClasses[variant],
                className
            )}
        />
    )
}

interface SkeletonCardProps {
    className?: string
}

export function SkeletonCard({ className }: SkeletonCardProps) {
    return (
        <div className={cn("space-y-3 p-4 border rounded-lg", className)}>
            <Skeleton variant="avatar" />
            <div className="space-y-2">
                <Skeleton variant="text" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        </div>
    )
}

interface SkeletonStatsCardProps {
    className?: string
}

export function SkeletonStatsCard({ className }: SkeletonStatsCardProps) {
    return (
        <div className={cn("space-y-3 p-6 border rounded-lg", className)}>
            <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton variant="avatar" className="h-8 w-8" />
            </div>
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-3/4" />
        </div>
    )
}
