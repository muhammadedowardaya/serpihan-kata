import { Section } from '@radix-ui/themes';
import SearchForm from '../../components/SearchForm';
import PostCard from '@/components/PostCard';
import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import { Post } from '@/types';

export default async function Home({
	searchParams,
}: {
	searchParams: Promise<{ query?: string }>;
}) {
	const query = (await searchParams).query;

	const posts = await prisma.post.findMany({
		include: {
			user: true,
			category: true,
		},
		where: {
			...(query && {
				// Hanya tambahkan kondisi jika query memiliki nilai
				OR: [
					{
						category: {
							label: {
								contains: query,
							},
						},
					},
					{
						description: {
							contains: query,
						},
					},
					{
						content: {
							contains: query,
						},
					},
				],
			}),
		},
		orderBy: {
			createdAt: 'desc',
		},
	});

	return (
		<div className="relative">
			<Section className="space-y-4 mx-auto max-w-[900px] px-[20px] relative">
				<div className="flex flex-col gap-y-[40px] md:flex-row items-center">
					<Image src="/logo_4x.png" width={300} height={300} alt="App Logo" />
					<div>
						<h1 className="text-3xl font-bold mb-4">SELAMAT DATANG!</h1>
						<p className="text-lg">
							Selamat datang di blog saya. Disini saya akan berbagi serpihan
							ilmu mengenai pengembangan website terutama bahasa pemrograman
							javascript.
						</p>
					</div>
				</div>

				{/* <div className="md:border-b border-slate-600"></div> */}
			</Section>
			<Section className="space-y-4 p-[20px] relative">
				<div className="sticky top-[80px]">
					{query ? (
						<h2 className="text-nowrap text-lg">{`Results for "${query}"`}</h2>
					) : (
						<div className="flex items-center gap-x-4">
							<span className="w-full h-[1px] bg-slate-400"></span>
							<h2 className="text-nowrap text-lg">
								{query ? `Results for "${query}"` : 'All Posts'}
							</h2>
							<span className="w-full h-[1px] bg-slate-400"></span>
						</div>
					)}

					<SearchForm query={query} className="mx-auto sticky top-[40px]" />
				</div>
				<ul className="flex flex-wrap gap-8 mt-[40px]">
					{posts?.length > 0 ? (
						posts.map((post) => (
							<PostCard key={post?.id} post={post as unknown as Post} />
						))
					) : (
						<p className="text-center">No posts</p>
					)}
				</ul>
			</Section>
		</div>
	);
}
