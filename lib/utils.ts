import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ======================================================================================================

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatDate(date: string) {
	return new Date(date).toLocaleString('id-ID', {
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	});
}

export function timeAgo(date: string): string {
	const now = new Date();
	const past = new Date(date);
	const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

	if (diffInSeconds < 60) {
		return `${diffInSeconds} detik`;
	}

	const diffInMinutes = Math.floor(diffInSeconds / 60);
	if (diffInMinutes < 60) {
		return `${diffInMinutes} menit`;
	}

	const diffInHours = Math.floor(diffInMinutes / 60);
	if (diffInHours < 24) {
		return `${diffInHours} jam`;
	}

	const diffInDays = Math.floor(diffInHours / 24);
	if (diffInDays < 7) {
		return `${diffInDays} hari`;
	}

	const diffInWeeks = Math.floor(diffInDays / 7);
	if (diffInWeeks < 4) {
		return `${diffInWeeks} minggu`;
	}

	const diffInMonths = Math.floor(diffInDays / 30);
	if (diffInMonths < 12) {
		return `${diffInMonths} bulan`;
	}

	const diffInYears = Math.floor(diffInDays / 365);
	return `${diffInYears} tahun`;
}

// ======================================================================================================
