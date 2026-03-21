"use client"

import { useState } from "react"
import { ProviderResponse } from "@/types"
import { useCreateAppointment } from "@/hooks/queries"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, CheckCircle2, Clock, CalendarIcon, Loader2 } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export function ProviderProfileDialog({ provider, children }: { provider: ProviderResponse, children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)
    const [showBooking, setShowBooking] = useState(false)
    const [date, setDate] = useState<Date>()
    
    const { mutate: createAppointment, isPending } = useCreateAppointment()

    const handleBooking = () => {
        if (!date) return;
        createAppointment({
            doctor_id: provider.type === 'doctor' ? provider.id : undefined,
            lab_id: provider.type === 'lab' ? provider.id : undefined,
            pharmacy_id: provider.type === 'pharmacy' ? provider.id : undefined,
            appointment_date: date.toISOString(),
            type: provider.type === 'lab' ? "lab_test" : provider.type === 'pharmacy' ? "pharmacy_visit" : "consultation",
            notes: `Appointment with ${provider.name}`
        }, {
            onSuccess: () => {
                setIsOpen(false)
                setShowBooking(false)
                setDate(undefined)
            }
        })
    }

    return (
        <Dialog open={isOpen} onOpenChange={(val) => {
            setIsOpen(val)
            if (!val) setShowBooking(false) // reset on close
        }}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto rounded-3xl p-0 gap-0">
                {/* Header Banner */}
                <div className="relative h-32 bg-primary/10 w-full flex-shrink-0">
                    <div className="absolute -bottom-10 left-6">
                        {provider.avatar_url ? (
                            <img src={provider.avatar_url} alt={provider.name} className="w-20 h-20 rounded-full border-4 border-background bg-card shadow-sm object-cover" />
                        ) : (
                            <div className="w-20 h-20 rounded-full border-4 border-background bg-primary/20 flex items-center justify-center shadow-sm">
                                <span className="text-2xl font-bold text-primary">{provider.name.charAt(0)}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-12 px-6 pb-6 space-y-6">
                    {/* Basic Info */}
                    <div>
                        <div className="flex justify-between items-start">
                            <div>
                                <DialogTitle className="text-xl font-bold">{provider.name}</DialogTitle>
                                <p className="text-muted-foreground font-medium capitalize mt-0.5">{provider.type}</p>
                            </div>
                            {provider.verified && (
                                <Badge variant="secondary" className="gap-1 bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Verified
                                </Badge>
                            )}
                        </div>

                        <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center text-sm">
                                <Star className="h-4 w-4 mr-1.5 text-yellow-500 fill-current" />
                                <span className="font-bold mr-1">{provider.rating}</span>
                                <span className="text-muted-foreground font-medium">/ 5.0</span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4 mr-1.5" />
                                {provider.distance_km} km away
                            </div>
                        </div>
                    </div>

                    {/* Bio / About */}
                    {provider.bio && (
                        <div className="space-y-2">
                            <h4 className="font-bold text-sm text-foreground">About</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {provider.bio}
                            </p>
                        </div>
                    )}

                    {/* Operating Hours */}
                    {provider.operating_hours && (
                        <div className="space-y-2">
                            <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                                <Clock className="w-4 h-4" /> Operating Hours
                            </h4>
                            <div className="bg-muted/30 rounded-2xl p-3 border border-border text-sm grid grid-cols-2 gap-2">
                                {Object.entries(provider.operating_hours).map(([day, hours]) => (
                                    <div key={day} className="flex flex-col">
                                        <span className="font-semibold capitalize text-foreground">{day}</span>
                                        <span className="text-muted-foreground">{String(hours)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Services / Pricing */}
                    {provider.services_offered && provider.services_offered.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="font-bold text-sm text-foreground">Services & Pricing</h4>
                            <div className="space-y-2">
                                {provider.services_offered.map((svc: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center bg-card border border-border rounded-xl p-3 shadow-sm">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-foreground">{svc.name}</span>
                                            {svc.description && <span className="text-xs text-muted-foreground mt-0.5">{svc.description}</span>}
                                        </div>
                                        <Badge variant="outline" className="font-bold bg-primary/5 text-primary border-primary/20 shrink-0 ml-4">
                                            {svc.price}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Booking & Message Section */}
                    <div className="pt-4 border-t border-border">
                        {!showBooking ? (
                            <div className="flex gap-2">
                                <Button onClick={() => setShowBooking(true)} className="flex-1 rounded-2xl h-12 font-bold text-[15px]">
                                    {provider.type === 'pharmacy' ? 'Visit Pharmacy' : 'Book Appointment'}
                                </Button>
                                {provider.user_id && (
                                    <Button variant="outline" className="flex-1 rounded-2xl h-12 font-bold text-[15px] text-primary" onClick={() => {
                                        window.location.href = `/dashboard/chat?userId=${provider.user_id}`
                                    }}>
                                        Message
                                    </Button>
                                )}
                            </div>
                        ) : (
                                <div className="space-y-4 bg-muted/30 p-4 rounded-3xl border border-border">
                                    <h4 className="font-bold text-sm">Select Date & Time</h4>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal h-12 rounded-xl bg-card",
                                                    !date && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                                                {date ? format(date, "PPP") : <span>Pick a date for your visit</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 rounded-2xl shadow-xl border-border">
                                            <Calendar
                                                mode="single"
                                                selected={date}
                                                onSelect={setDate}
                                                initialFocus
                                                disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                                                className="rounded-2xl"
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <div className="flex gap-2">
                                        <Button onClick={() => setShowBooking(false)} variant="ghost" className="rounded-xl flex-1">
                                            Cancel
                                        </Button>
                                        <Button onClick={handleBooking} disabled={!date || isPending} className="rounded-xl flex-1 font-bold">
                                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Confirm
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
        </Dialog>
    )
}
