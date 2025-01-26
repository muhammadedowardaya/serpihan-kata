import { auth } from '@/auth';

export default auth((req) => {
	const { nextUrl } = req;

	// const urlWithSearchParams = (path: string) => `${path}${nextUrl.search}`;

	const isLoggedIn = !!req.auth; // Memastikan status login berdasarkan req.auth
	const userRole = req.auth?.user?.role;

	// Daftar route yang memerlukan autentikasi
	const authRoutes = [
		'/dashboard',
		'/dashboard/profile',
		'/dashboard/posts',
		'/dashboard/saved-posts',
		'/dashboard/notifications',
	];
	// Route khusus admin
	const adminRoutes = ['/dashboard/categories'];

	// Apakah path yang diakses adalah route yang memerlukan autentikasi?
	const isAuthRoute = authRoutes.some((route) =>
		nextUrl.pathname.startsWith(route)
	);
	// Apakah path yang diakses adalah route khusus admin?
	const isAdminRoute = adminRoutes.some((route) =>
		nextUrl.pathname.startsWith(route)
	);

	// Jika route memerlukan autentikasi dan pengguna belum login, arahkan ke halaman awal
	if (isAuthRoute && !isLoggedIn) {
		return Response.redirect(new URL('/', nextUrl));
	}

	// Jika route memerlukan hak admin, tetapi pengguna adalah 'USER', arahkan ke dashboard utama
	if (isAdminRoute && userRole === 'USER') {
		return Response.redirect(new URL('/dashboard', nextUrl));
	}

	// Jika tidak ada kondisi yang sesuai, biarkan request diteruskan
	return;
});

export const config = {
	matcher: [
		// Skip Next.js internals and all static files, unless found in search params
		'/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
		// Always run for API routes
		'/(api|trpc)(.*)',
	],
};
