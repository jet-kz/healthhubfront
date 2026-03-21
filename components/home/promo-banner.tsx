import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"

interface PromoBannerProps {
    title: string
    description: string
    badge?: string
    image?: string
    href: string
    ctaText?: string
    variant?: "yellow" | "blue" | "gradient" | "image"
}

export function PromoBanner({
    title,
    description,
    badge,
    image,
    href,
    ctaText = "View offer",
    variant = "gradient",
}: PromoBannerProps) {
    const variantClasses = {
        yellow: "bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900",
        blue: "bg-gradient-to-r from-blue-400/20 to-cyan-400/20 border-2 border-blue-200",
        gradient: "bg-gradient-to-r from-primary/20 to-purple-500/20 border-2 border-primary/20",
        image: "bg-background border-2",
    }

    return (
        <Link href={href}>
            <Card
                className={`overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer ${variantClasses[variant]
                    }`}
            >
                <div className="flex items-center justify-between p-5 md:p-6 gap-4">
                    <div className="flex-1 space-y-2">
                        {badge && (
                            <Badge variant="secondary" className="mb-1">
                                {badge}
                            </Badge>
                        )}
                        <h3 className="font-bold text-lg md:text-xl line-clamp-2">{title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                            {description}
                        </p>
                        <Button
                            size="sm"
                            variant={variant === "yellow" ? "default" : "outline"}
                            className="mt-2"
                        >
                            {ctaText}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                    {image && (
                        <div className="relative h-32 w-32 md:h-40 md:w-40 shrink-0">
                            <Image
                                src={image}
                                alt={title}
                                fill
                                className="object-contain"
                            />
                        </div>
                    )}
                </div>
            </Card>
        </Link>
    )
}
