import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

// Helper to proxy requests
async function proxyRequest(request: Request, params: { all: string[] }) {
    // 1. Construct the Backend URL
    // "all" is an array of path segments, e.g. ["auth", "me"] -> "/auth/me"
    const path = params.all.join('/');
    const url = new URL(request.url);
    const searchParams = url.search; // Keep query params
    const backendUrl = `${BACKEND_URL}/${path}${searchParams}`;

    // 2. Get Auth Token from Cookie
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    // 3. Prepare Headers
    const headers: HeadersInit = {
        'Content-Type': request.headers.get('Content-Type') || 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // 4. Prepare Body (only for non-GET/HEAD methods)
    let body: BodyInit | null = null;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
        try {
            body = JSON.stringify(await request.json());
        } catch {
            // If parsing fails or body is empty, leave as null
        }
    }

    try {
        // 5. Forward Request
        const response = await fetch(backendUrl, {
            method: request.method,
            headers,
            body,
        });

        // 6. Return Backend Response
        // We need to parse strictly to return a proper JSON response to the client
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text(); // or blob if needed
        }

        return NextResponse.json(data, { status: response.status });

    } catch (error) {
        console.error(`Proxy Error [${request.method} ${path}]:`, error);
        return NextResponse.json(
            { detail: 'Proxy Error: Failed to reach backend' },
            { status: 502 }
        );
    }
}

// Export handlers for common methods
export async function GET(request: Request, { params }: { params: Promise<{ all: string[] }> }) {
    const resolvedParams = await params;
    return proxyRequest(request, resolvedParams);
}

export async function POST(request: Request, { params }: { params: Promise<{ all: string[] }> }) {
    const resolvedParams = await params;
    return proxyRequest(request, resolvedParams);
}

export async function PUT(request: Request, { params }: { params: Promise<{ all: string[] }> }) {
    const resolvedParams = await params;
    return proxyRequest(request, resolvedParams);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ all: string[] }> }) {
    const resolvedParams = await params;
    return proxyRequest(request, resolvedParams);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ all: string[] }> }) {
    const resolvedParams = await params;
    return proxyRequest(request, resolvedParams);
}
