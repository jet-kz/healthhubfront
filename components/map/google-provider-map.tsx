"use client"

import React, { useCallback, useState, useEffect, useRef } from "react"
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Circle } from "@react-google-maps/api"
import { Button } from "@/components/ui/button"
import { Star, MapPin, CheckCircle, ShieldCheck, Phone, Navigation, Loader2, Search, Crosshair } from "lucide-react"
import { BookingDialog } from "@/components/appointments/booking-dialog"

const containerStyle = {
    width: '100%',
    height: '600px',
}

const mapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    styles: [
        {
            "featureType": "administrative",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#444444" }]
        },
        {
            "featureType": "landscape",
            "elementType": "all",
            "stylers": [{ "color": "#f2f2f2" }]
        },
        {
            "featureType": "poi",
            "elementType": "all",
            "stylers": [{ "visibility": "off" }]
        },
        {
            "featureType": "road",
            "elementType": "all",
            "stylers": [{ "saturation": -100 }, { "lightness": 45 }]
        },
        {
            "featureType": "road.highway",
            "elementType": "all",
            "stylers": [{ "visibility": "simplified" }]
        },
        {
            "featureType": "road.arterial",
            "elementType": "labels.icon",
            "stylers": [{ "visibility": "off" }]
        },
        {
            "featureType": "transit",
            "elementType": "all",
            "stylers": [{ "visibility": "off" }]
        },
        {
            "featureType": "water",
            "elementType": "all",
            "stylers": [{ "color": "#46bcec" }, { "visibility": "on" }]
        }
    ]
}

interface ProviderMapProps {
    userLocation: { lat: number; lng: number } | null
    providers: any[]
    radiusKm: number
}

export default function GoogleProviderMap({ userLocation, providers, radiusKm }: ProviderMapProps) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries: ['places']
    })

    const [map, setMap] = useState<google.maps.Map | null>(null)
    const [selectedProvider, setSelectedProvider] = useState<any>(null)
    const [nearbyPlaces, setNearbyPlaces] = useState<any[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [isFollowing, setIsFollowing] = useState(false)
    const [accuracy, setAccuracy] = useState<number | null>(null)
    const placesService = useRef<google.maps.places.PlacesService | null>(null)
    const searchTimeout = useRef<NodeJS.Timeout | null>(null)
    const watchId = useRef<number | null>(null)

    const onLoad = useCallback(function callback(map: google.maps.Map) {
        setMap(map)
        placesService.current = new google.maps.places.PlacesService(map)
    }, [])

    const onUnmount = useCallback(function callback(map: google.maps.Map) {
        setMap(null)
        if (watchId.current) navigator.geolocation.clearWatch(watchId.current)
    }, [])

    const performSearch = useCallback((location: { lat: number, lng: number }) => {
        if (!placesService.current) return

        setIsSearching(true)
        const types = ['hospital', 'pharmacy', 'doctor', 'health']
        let allResults: any[] = []

        const searchForType = (type: string) => {
            return new Promise<void>((resolve) => {
                placesService.current?.nearbySearch({
                    location,
                    radius: radiusKm * 1000,
                    type: type
                }, (results, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                        allResults = [...allResults, ...results]
                    }
                    resolve()
                })
            })
        }

        Promise.all(types.map(searchForType)).then(() => {
            const uniqueResults = Array.from(new Map(allResults.map(item => [item['place_id'], item])).values())
            setNearbyPlaces(uniqueResults)
            setIsSearching(false)
        })
    }, [radiusKm])

    // Live Tracking (Follow Mode)
    useEffect(() => {
        if (isFollowing && navigator.geolocation) {
            watchId.current = navigator.geolocation.watchPosition(
                (position) => {
                    const loc = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    }
                    setAccuracy(position.coords.accuracy)
                    map?.panTo(loc)
                    // We don't performSearch on every move to save API costs, user can trigger manually or it happens on pan
                },
                (err) => console.error(err),
                { enableHighAccuracy: true, maximumAge: 0 }
            )
        } else if (watchId.current) {
            navigator.geolocation.clearWatch(watchId.current)
            watchId.current = null
            setAccuracy(null)
        }
        return () => {
            if (watchId.current) navigator.geolocation.clearWatch(watchId.current)
        }
    }, [isFollowing, map])

    // Initial and responsive search
    useEffect(() => {
        if (isLoaded && map && userLocation) {
            performSearch(userLocation)
            // Explicitly pan to the user's location on first load or change
            map.panTo(userLocation)
        }
    }, [isLoaded, map, userLocation, performSearch])

    // Handle initial center more gracefully
    const center = userLocation || { lat: 6.5244, lng: 3.3792 }

    // Handlers for manual map drags
    const onIdle = () => {
        if (!map) return
    }

    if (!isLoaded) return (
        <div className="h-[600px] w-full bg-muted flex items-center justify-center rounded-2xl border">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )

    // Calculate nearest facility
    const allFacilities = [
        ...providers.map(p => ({
            name: p.properties.name,
            lat: p.geometry.coordinates[1],
            lng: p.geometry.coordinates[0],
            onboarded: true,
            type: p.properties.type
        })),
        ...nearbyPlaces.map(p => ({
            name: p.name,
            lat: p.geometry.location.lat(),
            lng: p.geometry.location.lng(),
            onboarded: false,
            type: p.types?.includes('pharmacy') ? 'pharmacy' : (p.types?.includes('doctor') ? 'doctor' : 'hospital')
        }))
    ]

    const getDistance = (l1: any, l2: any) => {
        return Math.sqrt(Math.pow(l1.lat - l2.lat, 2) + Math.pow(l1.lng - l2.lng, 2))
    }

    const nearest = allFacilities.length > 0 ? allFacilities.reduce((prev, curr) => {
        return getDistance(center, prev) < getDistance(center, curr) ? prev : curr
    }) : null

    return (
        <div className="relative h-[600px] w-full rounded-2xl overflow-hidden border shadow-2xl bg-slate-50">
            <style jsx global>{`
                @keyframes pulse-blue {
                    0% { transform: scale(1); opacity: 0.5; }
                    50% { transform: scale(1.5); opacity: 0.2; }
                    100% { transform: scale(2); opacity: 0; }
                }
                .user-pulse {
                    width: 20px;
                    height: 20px;
                    background: #3b82f6;
                    border-radius: 50%;
                    position: relative;
                }
                .user-pulse::after {
                    content: '';
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    background: inherit;
                    border-radius: inherit;
                    animation: pulse-blue 2s infinite;
                }
            `}</style>
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={14}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={mapOptions}
            >
                {/* User Location Marker - Custom Pulse Wrapper */}
                <Marker
                    position={center}
                    draggable={true}
                    onDragEnd={(e) => {
                        const newLat = e.latLng?.lat()
                        const newLng = e.latLng?.lng()
                        if (newLat && newLng) {
                            performSearch({ lat: newLat, lng: newLng })
                        }
                    }}
                    icon={{
                        path: google.maps.SymbolPath.CIRCLE,
                        fillColor: '#3b82f6',
                        fillOpacity: 1,
                        strokeWeight: 4,
                        strokeColor: "white",
                        scale: 10
                    }}
                />

                {/* Accuracy Radius Indicator */}
                <Circle
                    center={center}
                    radius={accuracy || (radiusKm * 50)} // Show accuracy or a soft radius
                    options={{
                        fillColor: '#3b82f6',
                        fillOpacity: 0.1,
                        strokeColor: '#3b82f6',
                        strokeOpacity: 0.3,
                        strokeWeight: 1,
                        clickable: false,
                        editable: false,
                        zIndex: 1
                    }}
                />

                {/* JetCare Partners (From Backend) */}
                {providers.map((p: any, idx: number) => {
                    const [lng, lat] = p.geometry.coordinates
                    return (
                        <Marker
                            key={`partner-${idx}`}
                            position={{ lat, lng }}
                            onClick={() => setSelectedProvider({ ...p.properties, lat, lng, onboarded: true })}
                            icon={{
                                url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
                                scaledSize: new google.maps.Size(40, 40)
                            }}
                            zIndex={100}
                        />
                    )
                })}

                {/* Normal Places (From Google) */}
                {nearbyPlaces.map((place, idx) => {
                    const isPharmacy = place.types?.includes('pharmacy')
                    const isDoctor = place.types?.includes('doctor')

                    return (
                        <Marker
                            key={`place-${idx}`}
                            position={place.geometry.location}
                            onClick={() => setSelectedProvider({
                                id: place.place_id,
                                name: place.name,
                                address: place.vicinity,
                                rating: place.rating || 0,
                                type: isPharmacy ? 'pharmacy' : (isDoctor ? 'doctor' : 'hospital'),
                                lat: place.geometry.location.lat(),
                                lng: place.geometry.location.lng(),
                                onboarded: false
                            })}
                            icon={{
                                url: isPharmacy
                                    ? "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
                                    : (isDoctor ? "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png" : "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"),
                                scaledSize: new google.maps.Size(32, 32)
                            }}
                        />
                    )
                })}

                {selectedProvider && (
                    <InfoWindow
                        position={{ lat: selectedProvider.lat, lng: selectedProvider.lng }}
                        onCloseClick={() => setSelectedProvider(null)}
                    >
                        <div className="p-2 min-w-[200px] max-w-[250px] space-y-2">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                    <h3 className="font-bold text-sm text-slate-900 leading-tight">{selectedProvider.name}</h3>
                                    {selectedProvider.onboarded ? (
                                        <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold mt-0.5 uppercase tracking-wider">
                                            <ShieldCheck className="h-3 w-3" />
                                            JetCare Partner
                                        </div>
                                    ) : (
                                        <div className="text-[10px] text-slate-500 font-medium mt-0.5 italic flex items-center gap-1">
                                            <MapPin className="h-2.5 w-2.5" />
                                            Nearby Facility
                                        </div>
                                    )}
                                </div>
                                {selectedProvider.verified && (
                                    <CheckCircle className="h-4 w-4 text-blue-500" />
                                )}
                            </div>

                            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 p-1.5 rounded-lg">
                                <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                                <span className="truncate">{selectedProvider.address}</span>
                            </div>

                            <div className="flex items-center justify-between text-xs">
                                {selectedProvider.rating > 0 && (
                                    <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-full font-bold">
                                        <Star className="h-2.5 w-2.5 fill-current" />
                                        <span>{selectedProvider.rating.toFixed(1)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-2">
                                {selectedProvider.onboarded ? (
                                    <BookingDialog provider={selectedProvider}>
                                        <Button size="sm" className="w-full h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-lg">
                                            Book Now
                                        </Button>
                                    </BookingDialog>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1 h-8 text-[10px] rounded-lg border-slate-200"
                                            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedProvider.lat},${selectedProvider.lng}`, '_blank')}
                                        >
                                            <Navigation className="h-3 w-3 mr-1" />
                                            Directions
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>

            {/* Nearest Facility Indicator Overlay */}
            {nearest && (
                <div className="absolute top-4 left-4 z-[10] max-w-[200px]">
                    <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-white/20 space-y-1">
                        <div className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">Nearest to you</div>
                        <div className="text-sm font-bold text-slate-900 truncate">{nearest.name}</div>
                        <Button
                            variant="link"
                            size="sm"
                            className="p-0 h-auto text-[11px] text-blue-500 font-semibold"
                            onClick={() => setSelectedProvider({
                                ...nearest,
                                rating: 0,
                                address: "Click for details",
                                verified: false,
                                distance_km: 0
                            })}
                        >
                            View on map →
                        </Button>
                    </div>
                </div>
            )}

            {/* Search Override Overlay */}
            <div className="absolute top-20 right-4 z-[10] flex flex-col gap-2">
                <Button
                    size="sm"
                    className="bg-primary shadow-xl rounded-xl h-10 px-4 font-bold text-xs"
                    onClick={() => {
                        if (map) {
                            const mapCenter = map.getCenter()
                            if (mapCenter) {
                                performSearch({ lat: mapCenter.lat(), lng: mapCenter.lng() })
                            }
                        }
                    }}
                >
                    <Search className="h-4 w-4 mr-2" />
                    Search this Area
                </Button>
            </div>

            {/* Sidebar Controls */}
            <div className="absolute top-4 right-4 z-[10] flex flex-col gap-2">
                <Button
                    size="icon"
                    variant={isFollowing ? "default" : "secondary"}
                    className={`shadow-xl rounded-xl h-10 w-10 border-none transition-all ${isFollowing ? 'bg-blue-600 text-white scan-pulse' : 'bg-white text-blue-600'}`}
                    onClick={() => setIsFollowing(!isFollowing)}
                    title={isFollowing ? "Stop following location" : "Follow my movement"}
                >
                    <Navigation className={`h-5 w-5 ${isFollowing ? 'animate-pulse' : ''}`} />
                </Button>

                {!isFollowing && (
                    <Button
                        size="icon"
                        variant="secondary"
                        className="bg-white shadow-xl rounded-xl h-10 w-10 text-slate-700 border-none hover:bg-slate-50"
                        onClick={() => {
                            if (navigator.geolocation) {
                                setIsSearching(true)
                                navigator.geolocation.getCurrentPosition(
                                    (position) => {
                                        const loc = {
                                            lat: position.coords.latitude,
                                            lng: position.coords.longitude
                                        }
                                        map?.panTo(loc)
                                        performSearch(loc)
                                        setAccuracy(position.coords.accuracy)
                                    },
                                    (err) => {
                                        console.error(err)
                                        setIsSearching(false)
                                    },
                                    { enableHighAccuracy: true, timeout: 5000 }
                                )
                            }
                        }}
                    >
                        <Crosshair className="h-5 w-5" />
                    </Button>
                )}
            </div>

            {/* Summary Indicator */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[10]">
                <div className="bg-slate-900/90 text-white backdrop-blur-md px-5 py-2.5 rounded-full shadow-2xl flex flex-col items-center gap-1 min-w-[200px]">
                    <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${isSearching ? 'bg-yellow-400 animate-spin' : 'bg-green-400 animate-pulse'}`} />
                        <span className="text-xs font-bold tracking-tight">
                            {isSearching ? "Updating locations..." : `Found ${allFacilities.length} facilities nearby`}
                        </span>
                    </div>
                    <div className="flex items-center gap-4 text-[9px] text-slate-400 font-mono uppercase tracking-widest mt-1">
                        <span>Lat: {center.lat.toFixed(4)}</span>
                        <span>Lng: {center.lng.toFixed(4)}</span>
                    </div>
                    {accuracy && (
                        <div className="text-[10px] text-slate-400 font-medium tracking-wide flex items-center gap-1 mt-1">
                            <ShieldCheck className="h-3 w-3 text-blue-400" />
                            Accuracy: {accuracy.toFixed(0)}m
                        </div>
                    )}
                </div>
            </div>
            {nearest && (
                <div className="absolute bottom-24 right-4 z-[10] bg-white/90 p-2 rounded-lg shadow-sm border text-[10px] text-slate-500 max-w-[150px]">
                    Live Tracking: **{isFollowing ? 'ON' : 'OFF'}**
                </div>
            )}
        </div>
    )
}
