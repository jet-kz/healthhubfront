import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const response = await fetch(`${BACKEND_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { detail: data.detail || 'Registration failed' },
                { status: response.status }
            );
        }

        const { access_token, user } = data;

        // Create the response object
        const apiResponse = NextResponse.json({ user });

        // Set the HttpOnly cookie
        const cookieStore = await cookies();
        cookieStore.set('access_token', access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return apiResponse;
    } catch (error) {
        console.error('Register Proxy Error:', error);
        return NextResponse.json(
            { detail: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
