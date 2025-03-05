import PostCard from '@/components/PostCard';
import { Button } from '@/components/ui/button';
import { prisma } from '@/lib/prisma';
import { Post } from '@/types';
import {
	Bookmark,
	Heart,
	MessageCircle,
	PenLine,
	Rocket,
	ScanSearch,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default async function Home() {
	const popularPosts = await prisma.post.findMany({
		where: {
			isDraft: false,
		},
		take: 3,
		orderBy: {
			// views: 'desc',
			createdAt: 'desc',
		},
		include: {
			user: true,
			postTag: {
				include: {
					tag: true,
				},
			},
		},
	});

	return (
		<div className="relative bg-background">
			{/* Hero Section */}
			<section className="flex flex-col items-center text-center py-8 xxs:py-16 sm:py-20 md:py-12 px-6">
				<Image
					src="/logo_x4.png"
					width={400}
					height={400}
					alt="Serpihan Kata Logo"
					className="mb-10 sm:mb-6"
				/>
				<h1 className="xs:w-[350px] text-xl px-2 xs:text-2xl sm:text-3xl font-bold mb-4 font-quicksand">
					Bagikan Kisah, Tulisan, dan Inspirasi Anda
				</h1>
				<p className="xs:w-[350px] sm:w-[500px] text-base xs:text-lg sm:text-lg text-gray-600 max-w-2xl">
					Serpihan Kata adalah rumah bagi para penulis dan pembaca. Anda dapat
					menulis, menyukai, menyimpan, dan berdiskusi dalam satu tempat.
				</p>
				<div className="flex flex-col sm:flex-row mt-20 mb-10 sm:mt-10 flex gap-6 sm:gap-4">
					<Link href="/dashboard/posts/create">
						<Button
							size="lg"
							className="w-full max-w-[200px] xxs:max-w-[300px] block font-quicksand font-bold text-base flex flex-col xxs:flex-row h-max xxs:h-full py-2 items-center justify-center gap-0 xxs:gap-2 rounded-lg"
						>
							<Rocket className="w-[40px]" strokeWidth={2} />
							<span>Mulai Menulis</span>
						</Button>
					</Link>
					<Link href="/posts">
						<Button
							size="lg"
							variant="secondary"
							className="w-full max-w-[200px] xxs:max-w-[300px] block font-quicksand font-bold text-base flex flex-col xxs:flex-row h-max xxs:h-full py-2 items-center justify-center gap-0 xxs:gap-2 rounded-lg"
						>
							<ScanSearch className="w-[40px]" strokeWidth={2} />
							<span>Jelajahi Tulisan</span>
						</Button>
					</Link>
				</div>
			</section>

			{/* Section: Fitur Utama */}
			<section className="py-16 padding-content rounded-md">
				<h2 className=" text-lg xs:text-xl sm:text-2xl font-bold text-center px-4 mb-8">
					Apa yang Bisa Anda Lakukan?
				</h2>
				<div className="select-none grid grid-cols-1 px-4 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center">
					<div className="p-6 border shadow-md rounded-lg hover:bg-primary hover:text-primary-foreground">
						<PenLine className="w-8 h-8 mx-auto mb-2" />
						<h3 className="font-semibold mb-2">Menulis</h3>
						<p className="text-sm ">
							Tuangkan pemikiran Anda dalam bentuk tulisan yang bermakna.
						</p>
					</div>
					<div className="p-6 border  shadow-md rounded-lg hover:bg-primary hover:text-primary-foreground">
						<Heart className="w-8 h-8 mx-auto mb-2 " />
						<h3 className="font-semibold mb-2">Menyukai</h3>
						<p className="text-sm ">
							Beri apresiasi pada tulisan favorit Anda dengan tombol like.
						</p>
					</div>
					<div className="p-6 border  shadow-md rounded-lg hover:bg-primary hover:text-primary-foreground">
						<Bookmark className="w-8 h-8 mx-auto mb-2 " />
						<h3 className="font-semibold mb-2">Menyimpan</h3>
						<p className="text-sm ">
							Simpan tulisan inspiratif untuk dibaca kembali nanti.
						</p>
					</div>
					<div className="p-6 border shadow-md rounded-lg hover:bg-primary hover:text-primary-foreground">
						<MessageCircle className="w-8 h-8 mx-auto mb-2 " />
						<h3 className="font-semibold mb-2">Mengomentari</h3>
						<p className="text-sm ">
							Berdiskusi dan berbagi perspektif dengan pengguna lain.
						</p>
					</div>
				</div>
			</section>

			{/* Section: Tulisan Terbaru */}
			<section className="py-16 padding-content">
				<h2 className="text-2xl font-bold text-center mb-8">Tulisan Terbaru</h2>
				<div className="flex flex-wrap items-center justify-center gap-10">
					{/* Contoh card postingan, bisa di-fetch dari API */}
					{popularPosts.length > 0 ? (
						popularPosts.map((post) => (
							<PostCard
								key={post.id}
								post={post as unknown as Post}
								size="sm"
							/>
						))
					) : (
						<p>Tidak ada tulisan terbaru</p>
					)}
				</div>
				<div className="text-center mt-8 md:mt-20">
					<Link href="/posts">
						<Button
							size="lg"
							variant="secondary"
							className="text-base text-black font-extrabold font-quicksand active:scale-95 group"
						>
							Lihat semua tulisan
						</Button>
					</Link>
				</div>
			</section>
		</div>
	);
}
