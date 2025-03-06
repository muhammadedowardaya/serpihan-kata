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
		where: {
			isDraft: false,
			...(query?.trim()
				? {
						OR: [
							{
								title: {
									contains: query.toLowerCase(),
								},
							},
							{
								description: {
									contains: query.toLowerCase(),
								},
							},
							{
								content: {
									contains: query.toLowerCase(),
								},
							},
						],
				  }
				: {}),
		},
		orderBy,
	});

	// Ambil daftar tag
	const tags = await prisma.tag.findMany();

	return (
		<div className="relative">
			<Section className="relative pt-0 pb-6">
				{/* Header */}
				<div className="bg-background relative z-40 flex items-center gap-x-4 pt-8 px-1 justify-center text-center">
					<h2 className="text-2xl sm:text-4xl font-bold font-satisfy">
						Jelajahi Beragam Tulisan
					</h2>
				</div>
				<div className="relative xs:sticky bg-background top-0 z-40 py-4 shadow-border border-b padding-content">
					{/* Search & Filter */}
					<div className="flex flex-col min-[780px]:flex-row items-center gap-4 md:gap-2 justify-center">
						<SearchForm
							query={query}
							className="w-full max-w-[500px] h-[35px]"
						/>
						<div className="flex flex-wrap items-center gap-2">
							<FilterByTags
								tags={tags}
								className="h-[35px] px-3 py-1 btn-primary"
							/>
							<SortDropdownPosts
								sortBy={sortBy}
								className="h-[35px] px-3 py-1 btn-primary"
							/>
						</div>
					</div>

					{query && (
						<h3 className="text-center mt-4">
							Result for <q>{query}</q>
						</h3>
					)}
					{/* {tags && <p>{tags.map(({ label }) => label)}</p>} */}
				</div>

				{/* Post List */}
				{posts.length > 0 ? (
					<PostList
						className="flex justify-center flex-wrap gap-8 my-[40px] padding-content relative"
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
