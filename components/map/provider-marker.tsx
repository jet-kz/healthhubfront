"use client"

import { Marker, Popup } from "react-leaflet"
import { Icon } from "leaflet"
import { Button } from "@/components/ui/button"
import { Star, MapPin, CheckCircle, ShieldCheck, Phone, Navigation } from "lucide-react"
import { BookingDialog } from "@/components/appointments/booking-dialog"
import { ProviderResponse } from "@/types"

// Define custom icons
const createIcon = (color: string) => new Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
})

const icons = {
    partner_doctor: createIcon("green"),
    partner_lab: createIcon("gold"),
    partner_pharmacy: createIcon("orange"),
    normal_hospital: createIcon("blue"),
    normal_pharmacy: createIcon("red"),
    default: createIcon("grey")
}

interface ProviderMarkerProps {
    provider: any // Flexible for merging Partner and Normal types
    position: [number, number]
}

export function ProviderMarker({ provider, position }: ProviderMarkerProps) {
    // Select icon based on partner status and type
    const iconKey = provider.onboarded
        ? `partner_${provider.type}`
        : `normal_${provider.type}`
    const icon = icons[iconKey as keyof typeof icons] || icons.default

    return (
        <Marker position={position} icon={icon}>
            <Popup className="min-w-[280px] custom-popup">
                <div className="p-2 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                            <h3 className="font-bold text-base text-slate-900 leading-tight">{provider.name}</h3>
                            {provider.onboarded ? (
                                <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-bold mt-1 uppercase tracking-wider">
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                    JetCare Partner
                                </div>
                            ) : (
                                <div className="text-[10px] text-slate-500 font-medium mt-1 italic flex items-center gap-1">
                                    <MapPin className="h-2.5 w-2.5" />
                                    Nearby Facility
                                </div>
                            )}
                        </div>
                        {provider.verified && (
                            <div className="bg-blue-50 p-1 rounded-full">
                                <CheckCircle className="h-4 w-4 text-blue-500" />
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{provider.address}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        {provider.rating > 0 && (
                            <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-xs font-bold border border-amber-100">
                                <Star className="h-3 w-3 fill-current" />
                                <span>{provider.rating.toFixed(1)}</span>
                            </div>
                        )}
                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            {provider.distance_km > 0 ? `${provider.distance_km} km` : "Nearby"}
                        </span>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                        {provider.onboarded ? (
                            <BookingDialog provider={provider}>
                                <Button size="sm" className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-95">
                                    Book Appointment
                                </Button>
                            </BookingDialog>
                        ) : (
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-9 text-xs rounded-xl border-slate-200 text-slate-700 font-bold gap-2"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.location.href = `tel:${provider.phone || '00000000'}`;
                                    }}
                                >
                                    <Phone className="h-3 w-3" />
                                    Call
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-9 text-xs rounded-xl border-slate-200 text-slate-700 font-bold gap-2"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${position[0]},${position[1]}`, '_blank');
                                    }}
                                >
                                    <Navigation className="h-3 w-3" />
                                    Directions
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </Popup>
        </Marker>
    )
}
