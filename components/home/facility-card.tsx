import Image from "next/image"
import Link from "next/link"
import { MapPin, Star, Users } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface FacilityCardProps {
    id: string
    name: string
    type: "hospital" | "clinic" | "lab" | "pharmacy"
    image?: string
    address: string
    rating: number
    reviewCount: number
    doctorCount?: number
    distance?: string
}

export function FacilityCard({
    id,
    name,
    type,
    image,
    address,
    rating,
    reviewCount,
    doctorCount,
    distance,
}: FacilityCardProps) {
    const defaultImage = "/placeholder-facility.jpg"

    return (
        <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/20">
            {/* Facility Image */}
            <div className="relative h-48 w-full bg-gradient-to-br from-primary/5 to-primary/10">
                <Image
                    src={image || defaultImage}
                    alt={name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = "none"
                    }}
                />
                {distance && (
                    <Badge className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm text-foreground border">
                        {distance}
                    </Badge>
                )}
            </div>

            {/* Facility Info */}
            <div className="p-4 space-y-3">
                <div>
                    <Badge variant="secondary" className="mb-2 capitalize">
                        {type}
                    </Badge>
                    <h3 className="font-bold text-lg line-clamp-1">{name}</h3>
                </div>

                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{address}</span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{rating.toFixed(1)}</span>
                            <span className="text-sm text-muted-foreground">({reviewCount})</span>
                        </div>
                    </div>

                    {doctorCount && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>{doctorCount} Doctors</span>
                        </div>
                    )}
                </div>

                <Link href={`/facilities/${id}`} className="block">
                    <Button className="w-full" size="sm">
                        Book Now
                    </Button>
                </Link>
            </div>
        </Card>
    )
}
