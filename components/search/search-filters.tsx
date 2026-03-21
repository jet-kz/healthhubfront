"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

interface SearchFiltersProps {
    onSearch: (filters: any) => void
    loading?: boolean
}

export function SearchFilters({ onSearch, loading }: SearchFiltersProps) {
    return (
        <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by name, city, or specialization..."
                    className="pl-8"
                />
            </div>
            {/* Future: Add more filters dropdowns here (City, Rating) */}
            <Button disabled={loading}>
                Search
            </Button>
        </div>
    )
}
