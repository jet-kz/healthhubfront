import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, CheckCircle2 } from "lucide-react"
import { ProviderResponse } from "@/types"
import { ProviderProfileDialog } from "@/components/search/provider-profile-dialog"

interface ProviderCardProps {
    provider: ProviderResponse
}

export function ProviderCard({ provider }: ProviderCardProps) {
    return (
        <Card className="flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg font-bold">{provider.name}</CardTitle>
                        <CardDescription className="capitalize text-primary font-medium mt-1">
                            {provider.type}
                        </CardDescription>
                    </div>
                    {provider.verified && (
                        <Badge variant="secondary" className="gap-1">
                            <CheckCircle2 className="h-3 w-3 text-blue-500" />
                            Verified
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    {provider.address}, {provider.city} ({provider.distance_km} km)
                </div>
                <div className="flex items-center text-sm">
                    <Star className="h-4 w-4 mr-2 text-yellow-500 fill-current" />
                    <span className="font-medium mr-1">{provider.rating}</span>
                    <span className="text-muted-foreground">/ 5.0</span>
                </div>
            </CardContent>
            <CardFooter>
                <ProviderProfileDialog provider={provider}>
                    <Button className="w-full">View Profile</Button>
                </ProviderProfileDialog>
            </CardFooter>
        </Card>
    )
}
