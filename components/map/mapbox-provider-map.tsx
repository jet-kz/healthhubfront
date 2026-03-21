"use client"

import React, { useCallback, useState, useEffect, useRef, useMemo } from "react"
import Map, { Marker, Popup, NavigationControl, GeolocateControl, Layer, Source } from "react-map-gl/mapbox"
import 'mapbox-gl/dist/mapbox-gl.css'
import { Button } from "@/components/ui/button"
import { Star, MapPin, Navigation, Locate, ShieldCheck } from "lucide-react"
import { ProviderProfileDialog } from "@/components/search/provider-profile-dialog"
import * as turf from '@turf/turf'
import { MarkerPin, MARKER_CONFIG } from './marker-icons'

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ""

// Token validation
const isValidPublicToken = () => {
    if (!MAPBOX_TOKEN) return false
    // Public tokens should start with 'pk.'
    if (MAPBOX_TOKEN.startsWith('sk.')) {
        console.error('❌ MAPBOX ERROR: You are using a SECRET token (sk.) in the browser. Please use a PUBLIC token (pk.) instead. Get one from https://account.mapbox.com/')
        return false
    }
    if (!MAPBOX_TOKEN.startsWith('pk.')) {
        console.warn('⚠️ MAPBOX WARNING: Token does not start with pk. - this may not be a valid public token')
    }
    return true
}

interface ProviderMapProps {
    userLocation: { lat: number; lng: number } | null
    providers: any[]
    radiusKm: number
}



export default function MapboxProviderMap({ userLocation, providers, radiusKm }: ProviderMapProps) {
    const mapRef = useRef<any>(null)
    const [selectedProvider, setSelectedProvider] = useState<any>(null)
    const [mapError, setMapError] = useState<string | null>(null)
    const [hasFlownToUser, setHasFlownToUser] = useState(false)

    // Initialize at a neutral world view, will fly to user location once available
    const [viewState, setViewState] = useState({
        longitude: 0,
        latitude: 20,
        zoom: 2,
    })

    // Smooth fly to user location when it becomes available
    useEffect(() => {
        if (userLocation && mapRef.current && !hasFlownToUser) {
            console.log('🗺️ Map flying to user location:', userLocation)
            console.log('   Mapbox center: [lng, lat] =', [userLocation.lng, userLocation.lat])
            const map = mapRef.current.getMap()
            if (map) {
                map.flyTo({
                    center: [userLocation.lng, userLocation.lat],
                    zoom: 13,
                    duration: 2000,
                    essential: true
                })
                setHasFlownToUser(true)
            }
        }
    }, [userLocation, hasFlownToUser])

    // Recenter to user location
    const handleRecenter = useCallback(() => {
        if (userLocation && mapRef.current) {
            const map = mapRef.current.getMap()
            if (map) {
                map.flyTo({
                    center: [userLocation.lng, userLocation.lat],
                    zoom: 13,
                    duration: 1500,
                    essential: true
                })
            }
        }
    }, [userLocation])

    // Create GeoJSON for radius circle
    const radiusCircle = useMemo(() => {
        if (!userLocation) return null
        const center = turf.point([userLocation.lng, userLocation.lat])
        const radius = radiusKm
        const options = { steps: 64, units: 'kilometers' as const }
        const circle = turf.circle(center, radius, options)
        return circle
    }, [userLocation, radiusKm])

    // Validate token on mount
    useEffect(() => {
        if (!isValidPublicToken()) {
            setMapError('Invalid Mapbox token. Please check your .env.local file and ensure you are using a PUBLIC token (pk.xxx) not a SECRET token (sk.xxx)')
        }
    }, [])

    // Calculate nearest facility
    const nearestFacility = useMemo(() => {
        if (!userLocation || providers.length === 0) return null

        let nearest = providers[0]
        let minDistance = Infinity

        providers.forEach(p => {
            const [lng, lat] = p.geometry.coordinates
            const distance = Math.sqrt(
                Math.pow(lat - userLocation.lat, 2) +
                Math.pow(lng - userLocation.lng, 2)
            )
            if (distance < minDistance) {
                minDistance = distance
                nearest = p
            }
        })

        return nearest
    }, [providers, userLocation])

    // Check if map is centered on user
    const isCentered = useMemo(() => {
        if (!userLocation) return false
        const threshold = 0.01 // ~1km tolerance
        return Math.abs(viewState.latitude - userLocation.lat) < threshold &&
            Math.abs(viewState.longitude - userLocation.lng) < threshold
    }, [viewState, userLocation])

    // Error fallback UI
    if (mapError || !isValidPublicToken()) {
        return (
            <div className="relative h-[600px] w-full rounded-2xl overflow-hidden border-2 border-red-200 bg-red-50 shadow-2xl flex items-center justify-center">
                <div className="max-w-md p-6 text-center space-y-4">
                    <div className="text-6xl">🗺️</div>
                    <h3 className="text-xl font-bold text-red-900">Map Configuration Error</h3>
                    <p className="text-sm text-red-700">{mapError || 'Unable to initialize map'}</p>
                    <div className="bg-white p-4 rounded-lg text-left text-xs space-y-2">
                        <p className="font-bold text-slate-900">To fix this:</p>
                        <ol className="list-decimal list-inside space-y-1 text-slate-600">
                            <li>Go to <a href="https://account.mapbox.com/" target="_blank" className="text-blue-600 underline">https://account.mapbox.com/</a></li>
                            <li>Create a new <strong>public</strong> access token</li>
                            <li>Copy the token (it should start with <code className="bg-slate-100 px-1 rounded">pk.</code>)</li>
                            <li>Update <code className="bg-slate-100 px-1 rounded">.env.local</code>:</li>
                        </ol>
                        <pre className="bg-slate-100 p-2 rounded text-xs overflow-x-auto">
                            NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN="pk.your_token_here"
                        </pre>
                        <p className="text-red-600 font-semibold">⚠️ Do NOT use secret tokens (sk.) in the browser!</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="relative h-[600px] w-full rounded-2xl overflow-hidden border-2 border-slate-200 shadow-2xl">
            <Map
                ref={mapRef}
                {...viewState}
                onMove={evt => setViewState(evt.viewState)}
                mapboxAccessToken={MAPBOX_TOKEN}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/light-v11"
                attributionControl={false}
                reuseMaps
                onError={(e) => {
                    console.error('Mapbox Error:', e)
                    setMapError(e.error?.message || 'Map failed to load')
                }}
            >
                {/* Navigation Controls */}
                <NavigationControl position="top-right" />

                {/* Geolocation Control */}
                <GeolocateControl
                    position="top-right"
                    trackUserLocation
                    showUserHeading
                />

                {/* Search Radius Circle */}
                {radiusCircle && (
                    <Source id="radius-circle" type="geojson" data={radiusCircle}>
                        <Layer
                            id="radius-fill"
                            type="fill"
                            paint={{
                                'fill-color': '#3B82F6',
                                'fill-opacity': 0.1
                            }}
                        />
                        <Layer
                            id="radius-outline"
                            type="line"
                            paint={{
                                'line-color': '#3B82F6',
                                'line-width': 2,
                                'line-opacity': 0.5,
                                'line-dasharray': [2, 2]
                            }}
                        />
                    </Source>
                )}

                {/* Enhanced User Location Marker - Blue Dot with Pulse */}
                {userLocation && (
                    <Marker
                        longitude={userLocation.lng}
                        latitude={userLocation.lat}
                        anchor="center"
                        style={{ zIndex: 1000 }}
                    >
                        <div className="relative">
                            {/* Outer pulse ring */}
                            <div className="absolute inset-0 w-12 h-12 -ml-2 -mt-2 bg-blue-400 rounded-full animate-ping opacity-40" />
                            {/* Middle pulse ring */}
                            <div className="absolute inset-0 w-10 h-10 -ml-1 -mt-1 bg-blue-500 rounded-full animate-pulse opacity-60" />
                            {/* Main blue dot */}
                            <div className="relative w-8 h-8 bg-blue-600 rounded-full border-4 border-white shadow-2xl flex items-center justify-center">
                                <div className="w-2.5 h-2.5 bg-white rounded-full" />
                            </div>
                        </div>
                    </Marker>
                )}

                {/* Provider Markers */}
                {providers.map((provider, idx) => {
                    const [lng, lat] = provider.geometry.coordinates
                    const type = (provider.properties.type || 'hospital') as 'hospital' | 'pharmacy' | 'lab' | 'doctor'

                    return (
                        <Marker
                            key={`provider-${idx}`}
                            longitude={lng}
                            latitude={lat}
                            anchor="bottom"
                            onClick={(e) => {
                                e.originalEvent.stopPropagation()
                                setSelectedProvider({
                                    ...provider.properties,
                                    lat,
                                    lng,
                                    type
                                })
                            }}
                        >
                            <MarkerPin
                                type={type}
                                verified={provider.properties.verified}
                            />
                        </Marker>
                    )
                })}

                {/* Selected Provider Popup */}
                {selectedProvider && (
                    <Popup
                        longitude={selectedProvider.lng}
                        latitude={selectedProvider.lat}
                        anchor="bottom"
                        onClose={() => setSelectedProvider(null)}
                        closeButton={true}
                        closeOnClick={false}
                        offset={25}
                        className="custom-popup"
                    >
                        <div className="p-3 min-w-[280px] max-w-[300px] space-y-3">
                            {/* Header */}
                            <div className="space-y-1">
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="font-bold text-base text-slate-900 leading-tight">
                                        {selectedProvider.name}
                                    </h3>
                                    {selectedProvider.verified && (
                                        <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                                            <ShieldCheck className="h-3 w-3" />
                                            Verified
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-medium text-slate-500 capitalize">
                                        {MARKER_CONFIG[selectedProvider.type as keyof typeof MARKER_CONFIG]?.label || selectedProvider.type}
                                    </span>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="flex items-start gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
                                <MapPin className="h-4 w-4 mt-0.5 text-slate-400 shrink-0" />
                                <span className="text-xs leading-relaxed">{selectedProvider.address}</span>
                            </div>

                            {/* Rating & Distance */}
                            <div className="flex items-center justify-between text-sm">
                                {selectedProvider.rating > 0 && (
                                    <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-full">
                                        <Star className="h-3 w-3 fill-current" />
                                        <span className="font-bold text-xs">{selectedProvider.rating.toFixed(1)}</span>
                                    </div>
                                )}
                                {selectedProvider.distance_km && (
                                    <div className="text-xs text-slate-500 font-medium">
                                        {selectedProvider.distance_km.toFixed(1)} km away
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-2 border-t space-y-2">
                                <ProviderProfileDialog provider={selectedProvider}>
                                    <Button size="sm" className="w-full font-bold shadow-md">
                                        View Profile
                                    </Button>
                                </ProviderProfileDialog>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => {
                                        window.open(
                                            `https://www.google.com/maps/dir/?api=1&destination=${selectedProvider.lat},${selectedProvider.lng}`,
                                            '_blank'
                                        )
                                    }}
                                >
                                    <Navigation className="h-3 w-3 mr-2" />
                                    Get Directions
                                </Button>
                            </div>
                        </div>
                    </Popup>
                )}
            </Map>

            {/* Recenter Button - Floating Action Button */}
            {userLocation && (
                <div className="absolute bottom-24 right-4 z-10">
                    <Button
                        onClick={handleRecenter}
                        size="icon"
                        className={`w-12 h-12 rounded-full shadow-2xl transition-all duration-300 ${isCentered
                            ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                            : 'bg-blue-600 text-white hover:bg-blue-700 animate-bounce'
                            }`}
                        title="Recenter to my location"
                    >
                        <Locate className={`h-5 w-5 ${!isCentered && 'animate-pulse'}`} />
                    </Button>
                </div>
            )}

            {/* Nearest Facility Overlay */}
            {nearestFacility && (
                <div className="absolute top-4 left-4 z-10 max-w-[240px]">
                    <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-xl border-2 border-blue-100 space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                                Nearest to You
                            </span>
                        </div>
                        <div className="text-sm font-bold text-slate-900 truncate">
                            {nearestFacility.properties.name}
                        </div>
                        <div className="text-xs text-slate-500 capitalize">
                            {nearestFacility.properties.type}
                        </div>
                        <Button
                            variant="link"
                            size="sm"
                            className="p-0 h-auto text-xs text-blue-600 font-semibold"
                            onClick={() => {
                                const [lng, lat] = nearestFacility.geometry.coordinates
                                setSelectedProvider({
                                    ...nearestFacility.properties,
                                    lat,
                                    lng,
                                    type: nearestFacility.properties.type
                                })
                                if (mapRef.current) {
                                    const map = mapRef.current.getMap()
                                    map.flyTo({
                                        center: [lng, lat],
                                        zoom: 15,
                                        duration: 1500
                                    })
                                }
                            }}
                        >
                            View on map →
                        </Button>
                    </div>
                </div>
            )}

            {/* Stats Overlay */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
                <div className="bg-slate-900/95 backdrop-blur-md text-white px-5 py-2.5 rounded-full shadow-2xl border border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-xs font-bold tracking-tight">
                            Found {providers.length} facilities nearby
                        </span>
                    </div>
                </div>
            </div>

            {/* Custom Popup Styles */}
            <style jsx global>{`
                .mapboxgl-popup-content {
                    padding: 0 !important;
                    border-radius: 12px !important;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15) !important;
                }
                .mapboxgl-popup-close-button {
                    font-size: 20px !important;
                    padding: 8px !important;
                    color: #64748b !important;
                }
                .mapboxgl-popup-close-button:hover {
                    background-color: #f1f5f9 !important;
                    color: #0f172a !important;
                }
                .mapboxgl-popup-tip {
                    border-top-color: white !important;
                }
            `}</style>
        </div>
    )
}
