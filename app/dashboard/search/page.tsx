"use client"

import { useState, useEffect } from "react"
import { useSearchProviders, useNearbyProviders } from "@/hooks/queries"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { ProviderCard } from "@/components/search/provider-card"
import { Loader2, Search, Map as MapIcon, List as ListIcon, Navigation } from "lucide-react"
import dynamic from 'next/dynamic'

// Dynamically import Map to avoid SSR issues
const ProviderMap = dynamic(() => import('@/components/map/mapbox-provider-map'), {
    ssr: false,
    loading: () => <div className="h-[600px] w-full bg-muted animate-pulse rounded-2xl flex items-center justify-center border shadow-inner text-muted-foreground font-medium">Loading Map...</div>
})

export default function SearchPage() {
    const [viewMode, setViewMode] = useState<"list" | "map">("list")
    const [searchTerm, setSearchTerm] = useState("") // Not used in API yet, strictly for filtering maybe?
    const [type, setType] = useState<string>("all")
    const [radius, setRadius] = useState([25]) // increased default to 25km
    const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null)
    const [locationError, setLocationError] = useState<string | null>(null)
    const LAGOS = { lat: 6.5244, lng: 3.3792 }

    const searchPayload = {
        latitude: userLocation?.lat || 0,
        longitude: userLocation?.lng || 0,
        radius_km: radius[0],
        type: (type === "all" ? undefined : type) as any
    }

    const { data: providers, isLoading: loadingList } = useSearchProviders(
        searchPayload,
        !!userLocation && viewMode === "list"
    )

    const { data: geoJsonData, isLoading: loadingMap } = useNearbyProviders(
        searchPayload,
        !!userLocation && viewMode === "map"
    )

    // Get user location on mount
    useEffect(() => {
        const fetchLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const coords = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        }
                        console.log('📍 Browser Location Detected:', coords)
                        console.log('   Latitude:', coords.lat, 'Longitude:', coords.lng)
                        setUserLocation(coords)
                        setLocationError(null) // Clear any previous errors
                    },
                    (error) => {
                        console.error("Error getting location:", error)
                        let errorMessage = "Could not get your location. "

                        switch (error.code) {
                            case error.PERMISSION_DENIED:
                                errorMessage += "Please enable location permissions in your browser settings and click 'Use My Location' button above."
                                break
                            case error.POSITION_UNAVAILABLE:
                                errorMessage += "Location information unavailable. Using default location (Lagos)."
                                break
                            case error.TIMEOUT:
                                errorMessage += "Location request timed out. Click 'Use My Location' to retry."
                                break
                            default:
                                errorMessage += "Using default location (Lagos)."
                        }

                        setLocationError(errorMessage)
                        setUserLocation({ lat: 6.5244, lng: 3.3792 })
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000, // Increased timeout to 10 seconds
                        maximumAge: 0
                    }
                )
            } else {
                setLocationError("Geolocation is not supported by this browser.")
                setUserLocation({ lat: 6.5244, lng: 3.3792 })
            }
        }

        fetchLocation()
    }, [])

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Find Care</h1>
                    <p className="text-muted-foreground mt-1">
                        Discover doctors, labs, and pharmacies near you.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Location Button */}
                    <button
                        onClick={() => {
                            if (navigator.geolocation) {
                                navigator.geolocation.getCurrentPosition(
                                    (position) => {
                                        setUserLocation({
                                            lat: position.coords.latitude,
                                            lng: position.coords.longitude
                                        })
                                        setLocationError(null)
                                    },
                                    (error) => {
                                        let errorMessage = "Could not get your location. "
                                        switch (error.code) {
                                            case error.PERMISSION_DENIED:
                                                errorMessage += "Please enable location permissions in your browser settings."
                                                break
                                            case error.POSITION_UNAVAILABLE:
                                                errorMessage += "Location information unavailable."
                                                break
                                            case error.TIMEOUT:
                                                errorMessage += "Location request timed out. Try again."
                                                break
                                            default:
                                                errorMessage += "Using default location (Lagos)."
                                        }
                                        setLocationError(errorMessage)
                                    },
                                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                                )
                            }
                        }}
                        className="flex items-center gap-2 bg-card border border-border text-foreground hover:bg-accent hover:text-accent-foreground font-semibold text-sm px-4 py-2.5 rounded-full card-shadow-sm transition-all"
                    >
                        <Navigation className="h-4 w-4 text-primary" />
                        Use My Location
                    </button>

                    {/* View Mode Toggle */}
                    <div className="flex items-center bg-card border border-border p-1 rounded-full card-shadow-sm">
                        <button
                            onClick={() => setViewMode("list")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${viewMode === "list" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            <ListIcon className="h-4 w-4" />
                            List
                        </button>
                        <button
                            onClick={() => setViewMode("map")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${viewMode === "map" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            <MapIcon className="h-4 w-4" />
                            Map
                        </button>
                    </div>
                </div>
            </div>

            {/* Demo Area & Quick Hubs */}
            {userLocation && (
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <MapIcon className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-foreground">Explore Demo Hubs</p>
                                <p className="text-xs text-muted-foreground">Jump to areas with seeded provider data</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2">
                            {[
                                { name: "Lagos", lat: 6.5244, lng: 3.3792 },
                                { name: "Sapele", lat: 5.8900, lng: 5.6766 },
                                { name: "Warri", lat: 5.5167, lng: 5.7500 }
                            ].map((city) => (
                                <Button
                                    key={city.name}
                                    onClick={() => {
                                        setUserLocation({ lat: city.lat, lng: city.lng })
                                        setRadius([50])
                                    }}
                                    variant="outline"
                                    className={`rounded-full font-bold text-xs px-5 border-primary/20 hover:bg-primary hover:text-white transition-all ${
                                        Math.abs(userLocation.lat - city.lat) < 0.1 ? 'bg-primary text-white' : 'bg-white'
                                    }`}
                                    size="sm"
                                >
                                    {city.name}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Filters Bar */}
            <div className="flex gap-4 md:grid md:grid-cols-[200px_1fr_200px] flex-col md:flex-row items-center md:items-end bg-card p-5 rounded-3xl border border-border card-shadow relative z-10 w-full max-w-4xl mx-auto -mb-8">
                <div className="space-y-2 w-full">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">Provider Type</label>
                    <Select value={type} onValueChange={setType}>
                        <SelectTrigger className="rounded-xl border-border bg-muted/30 focus:ring-primary h-11">
                            <SelectValue placeholder="All types" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border shadow-xl">
                            <SelectItem value="all" className="rounded-lg">All Providers</SelectItem>
                            <SelectItem value="doctor" className="rounded-lg">Doctors</SelectItem>
                            <SelectItem value="lab" className="rounded-lg">Labs</SelectItem>
                            <SelectItem value="pharmacy" className="rounded-lg">Pharmacies</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-4 px-2 w-full pb-2 md:pb-0">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">Search Radius</label>
                        <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{radius[0]} km</span>
                    </div>
                    <Slider
                        value={radius}
                        onValueChange={setRadius}
                        max={50}
                        step={1}
                        className="py-2"
                    />
                </div>

                <div className="flex items-center justify-end h-11 w-full relative">
                    {locationError ? (
                        <span className="text-xs font-medium text-destructive bg-destructive/10 px-3 py-2 rounded-xl border border-destructive/20 w-full text-center">
                            {locationError}
                        </span>
                    ) : (
                        <div className="w-full flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground bg-muted/30 px-3 py-2 rounded-xl h-full border border-border">
                            <MapIcon className="h-3.5 w-3.5 text-primary" />
                            {userLocation ? "Using accurate location" : "Using default location"}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 min-h-[400px] pt-8">
                {viewMode === "list" ? (
                    <div className="space-y-4 max-w-5xl mx-auto">
                        {loadingList ? (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-[200px] rounded-3xl bg-muted/50 animate-pulse border border-border" />
                                ))}
                            </div>
                        ) : providers && providers.length > 0 ? (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {providers.map((provider) => (
                                    <ProviderCard key={provider.id} provider={provider} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-muted/30 border border-dashed border-border rounded-3xl max-w-2xl mx-auto mt-12">
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                                    <Search className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground">No providers found</h3>
                                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto text-center">
                                    Try increasing the search radius or changing the provider type.
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    // MAP VIEW
                    <div className="h-full min-h-[600px] rounded-3xl overflow-hidden border border-border card-shadow-md bg-card mt-6">
                        {loadingMap && !geoJsonData ? (
                            <div className="h-full w-full bg-muted/30 animate-pulse flex flex-col items-center justify-center">
                                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                                <p className="text-sm font-bold text-muted-foreground animate-pulse">Loading Providers Map...</p>
                            </div>
                        ) : (
                            <ProviderMap
                                userLocation={userLocation}
                                providers={geoJsonData?.features || []}
                                radiusKm={radius[0]}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
