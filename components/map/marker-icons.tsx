import React from 'react'

import { 
    StethoscopeIcon, 
    Medicine01Icon, 
    Building01Icon,
    Hospital01Icon
} from "hugeicons-react"

interface IconProps {
    className?: string
    size?: number
}

export const HospitalIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <path
            d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z"
            fill="currentColor"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M16 11H13V8C13 7.44772 12.5523 7 12 7C11.4477 7 11 7.44772 11 8V11H8C7.44772 11 7 11.4477 7 12C7 12.5523 7.44772 13 8 13H11V16C11 16.5523 11.4477 17 12 17C12.5523 17 13 16.5523 13 16V13H16C16.5523 13 17 12.5523 17 12C17 11.4477 16.5523 11 16 11Z"
            fill="white"
        />
    </svg>
)

export const PharmacyIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <path
            d="M6 3C4.89543 3 4 3.89543 4 5V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V5C20 3.89543 19.1046 3 18 3H6Z"
            fill="currentColor"
            stroke="white"
            strokeWidth="2"
        />
        <ellipse cx="12" cy="9" rx="4" ry="3" fill="white" />
        <ellipse cx="12" cy="15" rx="4" ry="3" fill="white" />
        <path
            d="M8 9C8 7.89543 9.79086 7 12 7C14.2091 7 16 7.89543 16 9"
            stroke="currentColor"
            strokeWidth="1.5"
        />
        <path
            d="M8 15C8 13.8954 9.79086 13 12 13C14.2091 13 16 13.8954 16 15"
            stroke="currentColor"
            strokeWidth="1.5"
        />
    </svg>
)

export const LabIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <path
            d="M9 3V9L5.5 15.5C4.5 17 5 19 6.5 19.5H17.5C19 19 19.5 17 18.5 15.5L15 9V3"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="currentColor"
        />
        <path
            d="M10 3H14M7 19H17"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
        />
        <circle cx="12" cy="13" r="1.5" fill="white" opacity="0.8" />
        <circle cx="9" cy="15" r="1" fill="white" opacity="0.6" />
        <circle cx="14.5" cy="14.5" r="1" fill="white" opacity="0.6" />
    </svg>
)

export const DoctorIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <circle
            cx="12"
            cy="8"
            r="4"
            fill="white"
            stroke="currentColor"
            strokeWidth="2"
        />
        <path
            d="M6 21C6 17.134 8.68629 14 12 14C15.3137 14 18 17.134 18 21"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            fill="currentColor"
        />
        <path
            d="M8 15C6 16 5 18 5 20M16 15C18 16 19 18 19 20"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
        />
        <path
            d="M10 19H14M12 17V21"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
        />
    </svg>
)

// Unified marker component with pin shape
interface MarkerPinProps {
    type: 'hospital' | 'pharmacy' | 'lab' | 'doctor'
    verified?: boolean
    className?: string
}

const MARKER_CONFIG = {
    hospital: {
        icon: Hospital01Icon,
        color: '#f43f5e', // rose-500
        label: 'Hospital'
    },
    pharmacy: {
        icon: Medicine01Icon,
        color: '#10b981', // emerald-500
        label: 'Pharmacy'
    },
    lab: {
        icon: Building01Icon,
        color: '#0ea5e9', // sky-500
        label: 'Laboratory'
    },
    doctor: {
        icon: StethoscopeIcon,
        color: '#1a6fff', // primary blue
        label: 'Doctor'
    }
}

export const MarkerPin: React.FC<MarkerPinProps> = ({ type, verified = false, className = '' }) => {
    const config = MARKER_CONFIG[type]
    const IconComponent = config.icon

    return (
        <div className={`flex flex-col items-center cursor-pointer transform hover:scale-110 transition-transform ${className}`}>
            {/* Main pin circle with icon */}
            <div
                className="w-10 h-10 rounded-full shadow-lg border-2 border-white flex items-center justify-center relative"
                style={{ backgroundColor: config.color }}
            >
                <IconComponent size={22} className="text-white" />
                {verified && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path
                                d="M10 3L4.5 8.5L2 6"
                                stroke="#10B981"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                )}
            </div>
            {/* Pin tail */}
            <div
                className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent"
                style={{ borderTopColor: config.color }}
            />
        </div>
    )
}

export { MARKER_CONFIG }
