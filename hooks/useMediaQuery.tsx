import { useEffect, useState } from 'react';

export const useMediaQuery = (query: string): boolean => {
	const [matches, setMatches] = useState(() => {
		if (typeof window === 'undefined') {
			return false;
		}
		return window.matchMedia(query).matches;
	});

	useEffect(() => {
		if (typeof window === 'undefined') return;

		const mediaQueryList = window.matchMedia(query);

		const updateMatch = () => setMatches(mediaQueryList.matches);

		// Pastikan matches diperbarui langsung saat komponen mount
		updateMatch();

		// Gunakan event listener langsung dari mediaQueryList
		mediaQueryList.addEventListener('change', updateMatch);

		return () => {
			mediaQueryList.removeEventListener('change', updateMatch);
		};
	}, [query]);

	return matches;
};
