import Link from "next/link"
import { LucideIcon } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface QuickActionTileProps {
    title: string
    subtitle: string
    icon: LucideIcon
    href: string
    badge?: string
    color?: string
}

export function QuickActionTile({
    title,
    subtitle,
    icon: Icon,
    href,
    badge,
    color = "primary",
}: QuickActionTileProps) {
    const colorClasses = {
        primary: "from-primary/10 to-primary/5 border-primary/20",
        blue: "from-blue-500/10 to-blue-500/5 border-blue-500/20",
        purple: "from-purple-500/10 to-purple-500/5 border-purple-500/20",
        green: "from-green-500/10 to-green-500/5 border-green-500/20",
    }

    return (
        <Link href={href}>
            <Card
                className={`p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses] || colorClasses.primary
                    }`}
            >
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-background/50 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0">
                        <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-sm truncate">{title}</h3>
                            {badge && (
                                <Badge variant="secondary" className="text-xs">
                                    {badge}
                                </Badge>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
                    </div>
                </div>
            </Card>
        </Link>
    )
}
