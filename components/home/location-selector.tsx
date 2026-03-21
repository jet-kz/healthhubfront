"use client"

import { useState } from "react"
import { MapPin, ChevronDown } from "lucide-react"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

interface LocationSelectorProps {
    defaultLocation?: string
    onLocationChange?: (location: string) => void
}

const popularLocations = [
    "N.Y Bronx",
    "JP Nagar, Bangalore",
    "Manhattan, New York",
    "Brooklyn, New York",
    "Mumbai, Maharashtra",
    "Delhi NCR",
    "Bangalore, Karnataka",
    "Hyderabad, Telangana",
]

export function LocationSelector({
    defaultLocation = "N.Y Bronx",
    onLocationChange,
}: LocationSelectorProps) {
    const [selectedLocation, setSelectedLocation] = useState(defaultLocation)
    const [open, setOpen] = useState(false)

    const handleLocationSelect = (location: string) => {
        setSelectedLocation(location)
        onLocationChange?.(location)
        setOpen(false)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    className="gap-2 hover:bg-accent/50 font-normal"
                    size="sm"
                >
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="font-medium">{selectedLocation}</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2" align="start">
                <div className="space-y-1">
                    <p className="text-sm font-semibold px-2 py-1 text-muted-foreground">
                        Popular Locations
                    </p>
                    {popularLocations.map((location) => (
                        <button
                            key={location}
                            onClick={() => handleLocationSelect(location)}
                            className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors ${selectedLocation === location
                                    ? "bg-accent font-medium"
                                    : ""
                                }`}
                        >
                            {location}
                        </button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    )
}
