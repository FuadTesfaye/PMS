import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  if (pathname === '/login') {
    if (session) {
      try {
        const payload = await decrypt(session);
        if (payload.role === 'admin') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        if (payload.role === 'pharmacist') return NextResponse.redirect(new URL('/pharmacist/dashboard', request.url));
        return NextResponse.redirect(new URL('/customer/dashboard', request.url));
      } catch (e) {
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  // Define protected routes
  const isProtected = pathname.startsWith('/admin') || 
                      pathname.startsWith('/pharmacist') || 
                      pathname.startsWith('/customer') ||
                      pathname === '/dashboard';

  if (isProtected) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const payload = await decrypt(session);
      const { role } = payload;

      // Role-based authorization
      if (pathname.startsWith('/admin') && role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      if (pathname.startsWith('/pharmacist') && role !== 'pharmacist') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      if (pathname.startsWith('/customer') && role !== 'customer') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      
      // Generic dashboard redirect
      if (pathname === '/dashboard') {
        if (role === 'admin') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        if (role === 'pharmacist') return NextResponse.redirect(new URL('/pharmacist/dashboard', request.url));
        return NextResponse.redirect(new URL('/customer/dashboard', request.url));
      }

    } catch (e) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
