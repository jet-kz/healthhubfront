"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Circle, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { ProviderMarker } from "./provider-marker"
import { Button } from "@/components/ui/button"
import { Crosshair, Map as MapIcon, Layers } from "lucide-react"
import { useNearbyFacilities } from "@/hooks/use-overpass"

interface ProviderMapProps {
    userLocation: { lat: number; lng: number } | null
    providers: any[]
    radiusKm: number
}

function MapController({ center }: { center: [number, number] }) {
    const map = useMap()
    useEffect(() => {
        map.flyTo(center, 13) // Zoom level 13
    }, [center, map])
    return null
}

export default function ProviderMap({ userLocation, providers, radiusKm }: ProviderMapProps) {
    const defaultCenter: [number, number] = [6.5244, 3.3792] // Lagos, Nigeria fallback
    const center = userLocation ? [userLocation.lat, userLocation.lng] as [number, number] : defaultCenter

    // Fetch real-world "Normal" locations from OpenStreetMap
    const { data: overpassData, isLoading: loadingOverpass } = useNearbyFacilities(
        center[0],
        center[1],
        radiusKm,
        true
    )

    // Fix for Leaflet default icon not loading in Next.js
    useEffect(() => {
        // @ts-ignore
        delete L.Icon.Default.prototype._getIconUrl
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        })
    }, [])

    return (
        <div className="relative h-[600px] w-full rounded-2xl overflow-hidden border shadow-2xl">
            <MapContainer
                center={center}
                zoom={14}
                style={{ height: "100%", width: "100%" }}
                className="z-0"
                zoomControl={false} // Custom zoom controls later for Bolt feel
            >
                {/* Premium Voyager Tile Layer - Cleaner and more professional than OSM default */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                {userLocation && (
                    <>
                        {/* Soft pulse effect around user */}
                        <Circle
                            center={center}
                            radius={radiusKm * 1000} // Convert km to meters
                            pathOptions={{ fillColor: '#3b82f6', fillOpacity: 0.05, color: '#3b82f6', weight: 1, dashArray: '5, 10' }}
                        />
                        {/* User Location Marker with Bolt-style Blue Dot */}
                        <Circle
                            center={center}
                            radius={150}
                            pathOptions={{ fillColor: '#3b82f6', fillOpacity: 1, color: 'white', weight: 3 }}
                        />
                        <MapController center={center} />
                    </>
                )}

                {/* 1. JetCare Partners (From our DB) - Premium High-Priority Markers */}
                {providers.map((feature: any, idx: number) => {
                    const [lng, lat] = feature.geometry.coordinates
                    return (
                        <ProviderMarker
                            key={`partner-${idx}`}
                            position={[lat, lng]}
                            provider={{
                                ...feature.properties,
                                onboarded: true,
                                premium: true
                            }}
                        />
                    )
                })}

                {/* 2. Normal Nearby Locations (From Overpass API) - Lighter Markers */}
                {overpassData?.map((item: any) => (
                    <ProviderMarker
                        key={`normal-${item.id}`}
                        position={[item.lat, item.lon]}
                        provider={{
                            id: item.id,
                            name: item.tags.name || (item.tags.amenity ? item.tags.amenity.charAt(0).toUpperCase() + item.tags.amenity.slice(1) : "Medical Facility"),
                            type: (() => {
                                if (item.tags.amenity === "pharmacy") return "pharmacy"
                                if (item.tags.amenity === "doctors" || item.tags.amenity === "dentist") return "doctor"
                                if (item.tags.amenity === "hospital" || item.tags.amenity === "clinic") return "hospital"
                                return "hospital"
                            })() as any,
                            address: item.tags["addr:street"] || "Nearby Location",
                            rating: 0,
                            verified: false,
                            distance_km: 0,
                            onboarded: false
                        }}
                    />
                ))}
            </MapContainer>

            {/* Map UI Overlays for Bolt Experience */}
            <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
                <Button
                    size="icon"
                    variant="secondary"
                    className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-xl rounded-xl border-none h-10 w-10 text-slate-700"
                    onClick={() => {
                        // Re-trigger location logic could go here
                    }}
                >
                    <Crosshair className="h-5 w-5" />
                </Button>
            </div>

            {/* Availability Badge */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000]">
                <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-2xl border border-white/20 flex items-center gap-2 whitespace-nowrap">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-semibold text-slate-800">
                        {loadingOverpass ? "Searching area..." : `${(providers.length + (overpassData?.length || 0))} Facilities found nearby`}
                    </span>
                </div>
            </div>
        </div>
    )
}

