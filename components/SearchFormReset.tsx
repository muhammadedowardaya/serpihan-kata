'use client';

import { XMarkIcon } from '@heroicons/react/24/solid';
import { Button } from '@radix-ui/themes';
import Link from 'next/link';
import React from 'react';

const SearchFormReset = () => {
	const reset = () => {
		const form = document.querySelector('form.search-form') as HTMLFormElement;
		if (form) {
			form.reset();
		}
	};

	return (
		<Button type="reset" onClick={reset} className="px-2 h-full text-destructive border border-black bg-white">
			<Link href="/">
				<XMarkIcon className="size-6" />
			</Link>
		</Button>
	);
};

export default SearchFormReset;
