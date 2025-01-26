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

		window.addEventListener('change', updateMatch);

		return () => {
			window.removeEventListener('change', updateMatch);
		};
	}, [query]);

	return matches;
};
