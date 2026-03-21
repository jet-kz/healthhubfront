"use client"

import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { ArrowRight } from "lucide-react"

interface QuickActionCardProps {
    title: string
    description: string
    icon: LucideIcon
    href: string
    variant?: "primary" | "success" | "warning" | "info"
    className?: string
}

const gradients = {
    primary: "from-purple-500 to-pink-600",
    success: "from-emerald-500 to-teal-600",
    warning: "from-orange-500 to-rose-600",
    info: "from-cyan-500 to-blue-600",
}

export function QuickActionCard({
    title,
    description,
    icon: Icon,
    href,
    variant = "primary",
    className,
}: QuickActionCardProps) {
    return (
        <Link href={href}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ duration: 0.2 }}
                className={cn(
                    "relative group overflow-hidden rounded-xl border bg-card p-6 card-glow cursor-pointer",
                    className
                )}
            >
                <div className="flex items-start gap-4">
                    <motion.div
                        className={cn(
                            "rounded-xl p-3 bg-gradient-to-br",
                            gradients[variant]
                        )}
                        whileHover={{ rotate: 5, scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Icon className="h-6 w-6 text-white" />
                    </motion.div>

                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors">
                            {title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                            {description}
                        </p>
                    </div>

                    <motion.div
                        className="text-muted-foreground group-hover:text-primary"
                        initial={{ x: 0 }}
                        whileHover={{ x: 4 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ArrowRight className="h-5 w-5" />
                    </motion.div>
                </div>

                {/* Subtle gradient overlay on hover */}
                <div className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 bg-gradient-to-br",
                    gradients[variant]
                )} />
            </motion.div>
        </Link>
    )
}
