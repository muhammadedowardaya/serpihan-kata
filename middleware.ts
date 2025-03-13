export const runtime = 'nodejs';
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
	const { nextUrl } = req;
	const isLoggedIn = !!req.auth;

	// Daftar rute yang memerlukan autentikasi
	const authRoutes = ['/dashboard'];

	// Periksa apakah pathname termasuk rute yang memerlukan autentikasi
	const isAuthRoute = authRoutes.some((route) =>
		nextUrl.pathname.startsWith(route)
	);

	if (!isLoggedIn && isAuthRoute) {
		// Redirect ke halaman login dengan query parameter `auth=login`
		const loginUrl = new URL(nextUrl.origin);
		loginUrl.pathname = '/'; // Ganti dengan halaman login yang benar
		loginUrl.searchParams.set('auth', 'login');

		return NextResponse.redirect(loginUrl);
	}

	return NextResponse.next();
});

export const config = {
	matcher: [
		// Skip Next.js internals and all static files, unless found in search params
		'/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
		// Always run for API routes
		'/(api|trpc)(.*)',
	],
};
