import { cn } from "@/lib/utils"

interface GradientTextProps {
    children: React.ReactNode
    className?: string
    variant?: "primary" | "success" | "warning" | "info"
    animated?: boolean
}

const gradientVariants = {
    primary: "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600",
    success: "bg-gradient-to-r from-emerald-600 to-teal-600",
    warning: "bg-gradient-to-r from-orange-600 to-rose-600",
    info: "bg-gradient-to-r from-cyan-600 to-blue-600",
}

export function GradientText({
    children,
    className,
    variant = "primary",
    animated = false
}: GradientTextProps) {
    return (
        <span
            className={cn(
                "bg-clip-text text-transparent",
                gradientVariants[variant],
                animated && "animate-gradient-x",
                className
            )}
            style={animated ? {
                backgroundSize: "200% 200%",
            } : undefined}
        >
            {children}
        </span>
    )
}
