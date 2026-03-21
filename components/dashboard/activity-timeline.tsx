"use client"

import { motion } from "framer-motion"
import { Calendar, FileText, Pill, Activity } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimelineItem {
    id: string
    type: "appointment" | "prescription" | "lab_result" | "vitals"
    title: string
    description: string
    time: string
}

interface ActivityTimelineProps {
    items?: TimelineItem[]
    className?: string
}

const typeConfig = {
    appointment: {
        icon: Calendar,
        color: "bg-blue-500",
        lightColor: "bg-blue-100 dark:bg-blue-950",
    },
    prescription: {
        icon: Pill,
        color: "bg-purple-500",
        lightColor: "bg-purple-100 dark:bg-purple-950",
    },
    lab_result: {
        icon: FileText,
        color: "bg-emerald-500",
        lightColor: "bg-emerald-100 dark:bg-emerald-950",
    },
    vitals: {
        icon: Activity,
        color: "bg-orange-500",
        lightColor: "bg-orange-100 dark:bg-orange-950",
    },
}

export function ActivityTimeline({ items, className }: ActivityTimelineProps) {
    if (!items || items.length === 0) {
        return (
            <div className={cn("flex flex-col items-center justify-center h-60", className)}>
                <div className="w-32 h-32 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                    <Activity className="h-12 w-12 text-muted-foreground/40" />
                </div>
                <h3 className="text-lg font-medium text-muted-foreground">No recent activity</h3>
                <p className="text-sm text-muted-foreground/60">
                    Your activity will appear here
                </p>
            </div>
        )
    }

    return (
        <div className={cn("space-y-4", className)}>
            {items.map((item, index) => {
                const config = typeConfig[item.type]
                const Icon = config.icon

                return (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex gap-4 group cursor-pointer"
                    >
                        <div className="relative flex flex-col items-center">
                            <div
                                className={cn(
                                    "rounded-full p-2.5 transition-all duration-200",
                                    config.lightColor,
                                    "group-hover:scale-110"
                                )}
                            >
                                <Icon className={cn("h-4 w-4", config.color.replace("bg-", "text-"))} />
                            </div>
                            {index < items.length - 1 && (
                                <div className="w-px h-full bg-border mt-2" />
                            )}
                        </div>

                        <div className="flex-1 pb-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h4 className="text-sm font-medium group-hover:text-primary transition-colors">
                                        {item.title}
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {item.description}
                                    </p>
                                </div>
                                <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                                    {item.time}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )
            })}
        </div>
    )
}
