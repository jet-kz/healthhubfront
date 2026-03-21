"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface HealthcareSearchProps {
    placeholder?: string
    onSearch?: (query: string) => void
}

export function HealthcareSearch({
    placeholder = "Search doctors, hospitals, medicines, tests and more",
    onSearch,
}: HealthcareSearchProps) {
    const [query, setQuery] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSearch?.(query)
    }

    return (
        <form onSubmit={handleSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
                type="text"
                placeholder={placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 pr-4 h-12 text-base border-2 focus-visible:ring-primary/20"
            />
        </form>
    )
}
