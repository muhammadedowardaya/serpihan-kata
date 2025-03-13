import { auth } from '@/auth';
import DecryptedText from '@/components/DecryptedText';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';
import { Heart, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

const Dashboard = async () => {
	const session = await auth();
	const userId = session?.user?.id;

	const myPostsLength = await prisma.post.count({
		where: {
			userId,
		},
	});

	const savedPosts = await prisma.post.findMany({
		where: {
			userId,
		},
		include: {
			savedPost: true,
		},
	});

	const mostLiked = await prisma.post.findMany({
		where: {
			userId,
			likes: {
				some: {
					NOT: {
						user: undefined,
					},
				},
			},
		},
		take: 5,
		select: {
			id: true,
			title: true,
			slug: true,
			likes: true,
		},
		orderBy: {
			likes: {
				_count: 'desc',
			},
		},
	});

	const mostCommented = await prisma.post.findMany({
		where: {
			userId,
			comments: {
				some: {
					NOT: {
						user: undefined,
					},
				},
			},
		},
		take: 5,
		select: {
			id: true,
			title: true,
			slug: true,
			comments: true,
		},
		orderBy: {
			comments: {
				_count: 'desc',
			},
		},
	});

	return (
		<div className="flex flex-wrap gap-6 my-6 w-full">
			<Link href="/dashboard/posts" className="w-full max-w-[350px]">
				<Card className="bg-primary text-primary-foreground grid grid-rows-[max-content_1fr]">
					<CardHeader>
						<h2 className="text-center">My Posts</h2>
					</CardHeader>
					<CardContent className="flex justify-center items-center">
						<p className="text-center font-bold text-5xl font-quicksand">
							<DecryptedText
								text={myPostsLength.toString()}
								speed={40}
								maxIterations={80}
								characters="0123456789"
								animateOn="view"
								revealDirection="center"
							/>
						</p>
					</CardContent>
				</Card>
			</Link>
			<Link href="/dashboard/saved-posts" className="w-full max-w-[350px]">
				<Card className="bg-primary text-primary-foreground grid grid-rows-[max-content_1fr]">
					<CardHeader>
						<h2 className="text-center">Saved Posts</h2>
					</CardHeader>
					<CardContent className="flex justify-center items-center">
						<p className="text-center font-bold text-5xl font-quicksand">
							<DecryptedText
								text={savedPosts.length.toString()}
								speed={40}
								maxIterations={80}
								characters="0123456789"
								animateOn="view"
								revealDirection="center"
							/>
						</p>
					</CardContent>
				</Card>
			</Link>

			<article className="w-full max-w-[350px]">
				<h2 className="text-center mb-2">My Posts are Most Liked</h2>
				{mostLiked.length > 0 ? (
					mostLiked.map((item) => (
						<MostLikedItem
							key={item.id}
							href={`/posts/${item.slug}`}
							title={item.title}
							likedCount={item.likes.length}
						/>
					))
				) : (
					<p className="text-slate-500 italic text-sm text-center">
						-- No Posts --
					</p>
				)}
			</article>

			<article className="w-full max-w-[350px]">
				<h2 className="text-center mb-2">My Posts are Most Commented</h2>
				{mostCommented.length > 0 ? (
					mostCommented.map((item) => (
						<MostCommentedItem
							key={item.id}
							title={item.title}
							href={`/posts/${item.slug}`}
							commentedCount={item.comments.length}
						/>
					))
				) : (
					<p className="text-slate-500 italic text-sm text-center">
						-- No Posts --
					</p>
				)}
			</article>
		</div>
	);
};

const MostLikedItem = ({
	title,
	href,
	likedCount,
}: {
	title: string;
	href: string;
	likedCount: number;
}) => {
	return (
		<Link
			href={href}
			className="flex items-start justify-between bg-primary text-primary-foreground py-3 pl-5 pr-4 rounded"
		>
			<h3>{title.length > 30 ? title.slice(0, 30) + '...' : title}</h3>
			<div className="flex items-center gap-1">
				<Heart className="fill-primary-foreground" />
				<span className="font-bold">{likedCount}</span>
			</div>
		</Link>
	);
};

const MostCommentedItem = ({
	title,
	href,
	commentedCount,
}: {
	title: string;
	href: string;
	commentedCount: number;
}) => {
	return (
		<Link
			href={href}
			className="flex items-start justify-between bg-primary text-primary-foreground py-3 pl-5 pr-4 rounded"
		>
			<h3>{title.length > 30 ? title.slice(0, 30) + '...' : title}</h3>
			<div className="flex items-center gap-1">
				<MessageCircle className="fill-primary-foreground" />
				<span className="font-bold">{commentedCount}</span>
			</div>
		</Link>
	);
};

export default Dashboard;
