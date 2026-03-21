"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"

export interface OverpassFacility {
    id: number
    lat: number
    lon: number
    tags: {
        name?: string
        amenity?: string
        "addr:street"?: string
        "addr:city"?: string
    }
}

export function useNearbyFacilities(lat: number, lon: number, radiusKm: number, enabled: boolean) {
    return useQuery({
        queryKey: ["overpass-facilities", lat, lon, radiusKm],
        queryFn: async () => {
            const radius = radiusKm * 1000 // Convert to meters
            const query = `
                [out:json][timeout:25];
                (
                  node["amenity"="hospital"](around:${radius},${lat},${lon});
                  node["amenity"="pharmacy"](around:${radius},${lat},${lon});
                  node["amenity"="doctors"](around:${radius},${lat},${lon});
                  node["amenity"="clinic"](around:${radius},${lat},${lon});
                  node["amenity"="dentist"](around:${radius},${lat},${lon});
                );
                out body;
                >;
                out skel qt;
            `
            const response = await fetch("https://overpass-api.de/api/interpreter", {
                method: "POST",
                body: query
            })

            if (!response.ok) throw new Error("Overpass API failed")

            const data = await response.json()
            return data.elements as OverpassFacility[]
        },
        enabled: enabled && !!lat && !!lon,
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 15 * 60 * 1000,
    })
}
