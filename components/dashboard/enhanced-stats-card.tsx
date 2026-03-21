"use client"

import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface EnhancedStatsCardProps {
    title: string
    value: string | number
    description?: string
    icon: LucideIcon
    trend?: {
        value: number
        label: string
    }
    variant?: "primary" | "success" | "warning" | "info"
    className?: string
}

const variantClasses = {
    primary: "border-l-4 border-l-purple-500",
    success: "border-l-4 border-l-emerald-500",
    warning: "border-l-4 border-l-orange-500",
    info: "border-l-4 border-l-cyan-500",
}

const iconBackgrounds = {
    primary: "bg-gradient-to-br from-purple-500 to-pink-600",
    success: "bg-gradient-to-br from-emerald-500 to-teal-600",
    warning: "bg-gradient-to-br from-orange-500 to-rose-600",
    info: "bg-gradient-to-br from-cyan-500 to-blue-600",
}

export function EnhancedStatsCard({
    title,
    value,
    description,
    icon: Icon,
    trend,
    variant = "primary",
    className,
}: EnhancedStatsCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -4 }}
        >
            <Card className={cn("card-glow overflow-hidden", variantClasses[variant], className)}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="text-sm font-medium text-muted-foreground">
                        {title}
                    </div>
                    <motion.div
                        className={cn(
                            "relative h-10 w-10 rounded-full flex items-center justify-center",
                            iconBackgrounds[variant]
                        )}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Icon className="h-5 w-5 text-white" />
                        {trend && trend.value > 0 && (
                            <motion.div
                                className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-green-500"
                                initial={{ scale: 0 }}
                                animate={{ scale: [0, 1.2, 1] }}
                                transition={{ duration: 0.3, delay: 0.2 }}
                            >
                                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                                    ↑
                                </span>
                            </motion.div>
                        )}
                    </motion.div>
                </CardHeader>
                <CardContent>
                    <motion.div
                        className="text-2xl font-bold"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                    >
                        {value}
                    </motion.div>
                    {description && (
                        <p className="text-xs text-muted-foreground mt-1">
                            {description}
                        </p>
                    )}
                    {trend && (
                        <div className="flex items-center gap-1 mt-2">
                            <span
                                className={cn(
                                    "text-xs font-medium",
                                    trend.value > 0 ? "text-green-600" : "text-red-600"
                                )}
                            >
                                {trend.value > 0 ? "+" : ""}
                                {trend.value}%
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {trend.label}
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}
