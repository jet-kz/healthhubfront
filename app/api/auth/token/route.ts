import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('access_token');
    
    if (!tokenCookie || !tokenCookie.value) {
        return NextResponse.json({ token: null }, { status: 401 });
    }
    
    return NextResponse.json({ token: tokenCookie.value });
}
