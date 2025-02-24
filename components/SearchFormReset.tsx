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
		<Button
			type="reset"
			variant="ghost"
			onClick={reset}
			className="h-full block !p-0"
		>
			<Link
				href="/posts"
				className="px-2 py-[5px] rounded h-full w-full btn-secondary block flex items-center"
			>
				<XMarkIcon className="size-6" />
			</Link>
		</Button>
	);
};

export default SearchFormReset;
