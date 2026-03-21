import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const token = request.cookies.get('access_token')?.value
    const { pathname } = request.nextUrl

    // Define protected routes
    const protectedRoutes = ['/dashboard', '/profile', '/settings']

    // Check if the current path starts with any of the protected routes
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

    if (isProtectedRoute && !token) {
        const loginUrl = new URL('/login', request.url)
        // Optional: Add a redirect param to send them back after login
        loginUrl.searchParams.set('from', pathname)
        return NextResponse.redirect(loginUrl)
    }

    // Basic role setup - inspect the JWT payload without verifying signature (since this is edge middleware)
    if (token && pathname === '/dashboard') {
        try {
            // JWT is structured as header.payload.signature
            const payloadPattern = token.split('.')[1];
            if (payloadPattern) {
                const decodedPayload = JSON.parse(atob(payloadPattern));
                
                // If the user's role in the token is "doctor", redirect them to the doctor dashboard
                if (decodedPayload.role === 'doctor' || decodedPayload.role === 'DOCTOR') {
                    return NextResponse.redirect(new URL('/dashboard/doctor', request.url));
                }
            }
        } catch (e) {
            console.error("Failed to parse token payload in middleware", e);
        }
    }

    // Define auth routes (pages that shouldn't be accessible if already logged in)
    const authRoutes = ['/login', '/signup', '/forgot-password']
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

    if (isAuthRoute && token) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
    ],
}
