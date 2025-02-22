import { Section } from '@radix-ui/themes';
import { prisma } from '@/lib/prisma';
import SearchForm from '@/components/SearchForm';
import { PostList } from '@/components/PostList';
import { FilterByTags } from '@/components/FilterByTags';
import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/types';
import { SortDropdownPosts } from '@/components/SortDropdownPosts';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Post list',
	description: 'Daftar postingan pada Serpihan Kata',
	icons: {
		icon: '/favicon.ico',
	},
};

export default async function PostsPage({
	searchParams,
}: {
	searchParams: Promise<{ query?: string; sort?: string }>;
}) {
	const params = await searchParams;
	const query = params.query || '';
	const sortBy = params.sort || 'latest';

	// Sorting logic di server
	let orderBy;
	if (sortBy === 'popular') {
		orderBy = { views: 'desc' as const };
	} else if (sortBy === 'most_commented') {
		orderBy = { comments: { _count: 'desc' as const } };
	} else {
		orderBy = { createdAt: 'desc' as const };
	}

	// Ambil post dari database
	const posts = await prisma.post.findMany({
		include: {
			user: true,
			postTag: { include: { tag: true } },
		},
		where: query
			? {
					OR: [
						{ title: { contains: query } },
						{ description: { contains: query } },
						{ content: { contains: query } },
					],
			  }
			: {},
		orderBy,
	});

	// Ambil daftar tag
	const tags = await prisma.tag.findMany();

	return (
		<div className="relative">
			<Section className="space-y-6 relative pt-0 pb-6">
				{/* Header */}
				<div className="xs:sticky top-0 z-40 bg-[var(--primary)] pb-4 pt-6 md:pt-0 shadow-border border-b padding-content">
					<div className="flex items-center gap-x-4 mb-4 px-1 justify-center text-center">
						<h2 className="text-2xl sm:text-4xl font-bold font-satisfy">
							Jelajahi Beragam Tulisan
						</h2>
					</div>

					{/* Search & Filter */}
					<div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 justify-center">
						<SearchForm
							query={query}
							className="w-full max-w-[500px] h-[45px]"
						/>
						<div className="flex items-center gap-2">
							<FilterByTags
								tags={tags}
								className="h-[45px] px-3 py-1 background-highlight hover:background-highlight text-dark hover:text-dark"
							/>
							<SortDropdownPosts
								sortBy={sortBy}
								className="h-[45px] px-3 py-1 background-highlight text-dark hover:background-highlight hover:text-dark"
							/>
						</div>
					</div>
				</div>

				{/* Post List */}
				{posts.length > 0 ? (
					<PostList
						className="flex justify-center flex-wrap gap-8 mt-[40px] padding-content relative"
						posts={posts as unknown as Post[]}
					/>
				) : (
					// Empty State
					<div className="text-center py-20">
						<Image
							src="/empty-state.png"
							width={200}
							height={200}
							alt="Empty State"
						/>
						<p className="text-gray-600 mt-4">
							Belum ada tulisan yang tersedia.
						</p>
						<Link href="/write">
							<button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg">
								Mulai Menulis
							</button>
						</Link>
					</div>
				)}
			</Section>
		</div>
	);
}
