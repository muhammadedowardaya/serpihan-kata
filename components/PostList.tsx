'use client';

import { Post } from '@/types';
import React from 'react';
import PostCard from './PostCard';
import { useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { filterByTagsAtom } from '@/jotai';
import axios from 'axios';
// import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Loader } from './Loader';
import { useSearchParams } from 'next/navigation';

export const PostList = ({
	posts,
	className,
}: {
	posts: Post[];
	className?: string;
}) => {
	const [filterByTags] = useAtom(filterByTagsAtom);

	// const xs = useMediaQuery('(min-width: 360px)');
	// const sm = useMediaQuery('(min-width: 640px)');

	const searchParams = useSearchParams();
	const query = searchParams.get('query') || '';
	const sortBy = searchParams.get('sort') || 'latest';

	const getPosts = useQuery({
		queryKey: ['posts', filterByTags, query, sortBy], // 🔥 Semua parameter masuk ke dalam queryKey
		queryFn: async () => {
			const params = new URLSearchParams();

			// Jika ada filter tag, tambahkan ke URL
			if (filterByTags.length > 0) {
				params.append(
					'filterByTags',
					filterByTags.map((tag) => tag.value).join(',')
				);
			}

			// Jika ada query pencarian, tambahkan ke URL
			if (query) {
				params.append('query', query);
			}

			// Tambahkan sorting
			params.append('sort', sortBy);

			const response = await axios.get(`/api/posts?${params.toString()}`);
			return response.data.posts;
		},
		enabled: true, // 🔥 Pastikan query tetap berjalan bahkan jika filter kosong
		placeholderData: posts, // Gunakan data awal sebagai placeholder
	});

	return (
		<ul className={className}>
			{getPosts.isPending ? (
				<Loader text="Loading posts..." />
			) : getPosts.data && getPosts.data.length > 0 ? (
				getPosts.data.map((post: Post) => (
					<PostCard key={post.id} post={post} size={'sm'} />
				))
			) : (
				<p className="text-center">No posts</p>
			)}
		</ul>
	);
};
