import Link from "next/link"
import { LucideIcon } from "lucide-react"
import { Card } from "@/components/ui/card"

interface ServiceCategoryCardProps {
    title: string
    description: string
    count: number
    icon: LucideIcon
    href: string
    variant?: "default" | "compact"
}

export function ServiceCategoryCard({
    title,
    description,
    count,
    icon: Icon,
    href,
    variant = "default",
}: ServiceCategoryCardProps) {
    if (variant === "compact") {
        // Mobile-optimized compact view (book2 style)
        return (
            <Link href={href}>
                <Card className="p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 hover:border-primary/20">
                    <div className="flex flex-col items-center text-center space-y-2">
                        <div className="h-12 w-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center">
                            <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm">{title}</h3>
                            <p className="text-xs text-muted-foreground">{description}</p>
                        </div>
                    </div>
                </Card>
            </Link>
        )
    }

    // Desktop spacious view (book1 style)
    return (
        <Link href={href}>
            <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 hover:border-primary/20 h-full">
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="h-16 w-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center">
                        <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-bold text-lg">{title}</h3>
                        <p className="text-sm text-muted-foreground">({count})</p>
                    </div>
                </div>
            </Card>
        </Link>
    )
}
