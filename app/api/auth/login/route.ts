import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const response = await fetch(`${BACKEND_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            credentials: 'include', // Important for cookies
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { detail: data.detail || 'Login failed' },
                { status: response.status }
            );
        }

        // Backend now returns: { token_type: "bearer", user: {...with name} }
        // Create the response object with user data
        const apiResponse = NextResponse.json(data);

        // Forward all cookies from backend (access_token and refresh_token)
        const setCookieHeader = response.headers.get('set-cookie');
        if (setCookieHeader) {
            // Backend sends multiple cookies, we need to forward them all
            const cookies = setCookieHeader.split(', ');
            cookies.forEach(cookie => {
                apiResponse.headers.append('Set-Cookie', cookie);
            });
        }

        return apiResponse;
    } catch (error) {
        console.error('Login Proxy Error:', error);
        return NextResponse.json(
            { detail: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
