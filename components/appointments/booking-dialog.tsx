"use client"

import { useState } from "react"
import { useCreateAppointment } from "@/hooks/queries"
import { ProviderResponse } from "@/types"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"

interface BookingDialogProps {
    provider: ProviderResponse
    children: React.ReactNode
}

export function BookingDialog({ provider, children }: BookingDialogProps) {
    const [date, setDate] = useState<Date>()
    const [isOpen, setIsOpen] = useState(false)
    const { mutate: createAppointment, isPending } = useCreateAppointment()

    const handleBooking = () => {
        if (!date) return;

        createAppointment({
            doctor_id: provider.type === 'doctor' ? provider.id : undefined,
            lab_id: provider.type === 'lab' ? provider.id : undefined,
            appointment_date: date.toISOString(),
            type: "consultation", // Default to consultation for now
            notes: "Booked via dashboard"
        }, {
            onSuccess: () => {
                setIsOpen(false)
                setDate(undefined)
                // Could show toast success here
            }
        })
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Book Appointment</DialogTitle>
                    <DialogDescription>
                        Schedule a visit with {provider.name}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Select Date</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-[280px] justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                    disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleBooking} disabled={!date || isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm Booking
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
