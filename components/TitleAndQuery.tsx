'use client';

import { filterByTagsAtom } from '@/jotai';
import { useAtom } from 'jotai';
import React from 'react';

export const TitleAndQuery = ({ query }: { query?: string }) => {
	const [filterByTags] = useAtom(filterByTagsAtom);
	const hasFilter = filterByTags.length > 0;

	return (
		<div className="text-base xxs:text-lg xs:text-xl flex flex-col justify-center gap-2 sm:gap-4 items-start sm:items-center">
			<div className="flex flex-col gap-2">
				<h2 className="text-nowrap">{query ? `Results for` : 'All Posts'}</h2>
				<p className={`${!query && 'hidden'} text-sm`}>{`"${query}"`}</p>
			</div>

			{hasFilter && (
				<div className="flex flex-col gap-2 sm:mb-2 sm:items-center">
					<h2 className="text-nowrap">Filter by Tags: </h2>
					<div className="flex flex-wrap gap-2">
						{filterByTags.map((tag) => (
							<span
								key={tag.id}
								className="border border-slate-500 rounded-full px-2 text-sm"
							>
								{tag.label}
							</span>
						))}
					</div>
				</div>
			)}
		</div>
	);
};
