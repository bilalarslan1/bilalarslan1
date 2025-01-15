import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check for maintenance mode
  const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === '1';
  const isMaintenancePage = request.nextUrl.pathname === '/maintenance';
  
  // If in maintenance mode and not already on maintenance page, redirect to maintenance
  if (isMaintenanceMode && !isMaintenancePage) {
    return NextResponse.redirect(new URL('/maintenance', request.url));
  }

  // If not in maintenance mode but on maintenance page, redirect to home
  if (!isMaintenanceMode && isMaintenancePage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Get response
  const response = NextResponse.next();

  // Add security headers
  const headers = response.headers;

  // CORS headers
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Security headers
  headers.set('X-DNS-Prefetch-Control', 'on');
  headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  headers.set('X-XSS-Protection', '1; mode=block');
  headers.set('X-Frame-Options', 'SAMEORIGIN');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'origin-when-cross-origin');

  // Content Security Policy - Development için daha gevşek kurallar
  headers.set(
    'Content-Security-Policy',
    `
      default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;
      script-src * 'unsafe-inline' 'unsafe-eval' data: blob:;
      style-src * 'unsafe-inline';
      img-src * data: blob:;
      font-src * data:;
      connect-src *;
      frame-src *;
      worker-src * blob:;
      child-src * blob:;
      media-src *;
      object-src *;
      manifest-src *;
      form-action *;
      frame-ancestors 'self';
    `.replace(/\s+/g, ' ').trim()
  );

  return response;
}

// Specify which routes this middleware will run on
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 