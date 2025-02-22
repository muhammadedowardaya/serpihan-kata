import {
	createNotification,
	getUnreadNotification,
} from '@/actions/notification';
import { getTargetUser } from '@/actions/user';
import { prisma } from '@/lib/prisma';
import { TargetUser } from '@/types';
import { NextRequest, NextResponse } from 'next/server';

export const POST = async (request: NextRequest) => {
	try {
		const { userId, commentId, postId } = await request.json();
		console.info({ userId, commentId, postId });
		if (!userId || (!postId && !commentId)) {
			console.info('Invalid data pada api/like | POST');
			return NextResponse.json(
				{ success: false, message: 'Invalid data' },
				{ status: 400 }
			);
		}

		let unreadCount: number = 0;
		// 3️⃣ Ambil userId pemilik post/comment
		let targetUserId: string | null = null;
		let targetUser: TargetUser | null = null;
		let likeId: string | null = null;

		await prisma.$transaction(async (prisma) => {
			// 1️⃣ Cek apakah like sudah ada
			const existingLike = await prisma.like.findFirst({
				where: {
					userId,
					postId: postId || undefined,
					commentId: commentId || undefined,
				},
			});

			if (existingLike) {
				throw new Error('User sudah memberi like pada post/comment ini.');
			}

			// 2️⃣ Tambahkan like ke post atau comment jika belum ada
			const like = await prisma.like.create({
				data: {
					user: {
						connect: { id: userId },
					},
					post: postId ? { connect: { id: postId } } : undefined,
					comment: commentId ? { connect: { id: commentId } } : undefined,
				},
				select: {
					id: true,
				},
			});

			likeId = like.id;

			if (postId) {
				const post = await prisma.post.findUnique({
					where: { id: postId },
					select: { userId: true },
				});
				targetUserId = post?.userId || null;
			} else if (commentId) {
				const comment = await prisma.comment.findUnique({
					where: { id: commentId },
					select: { userId: true },
				});
				targetUserId = comment?.userId || null;
			}

			console.info({ targetUserId });
		});

		// 4️⃣ Buat notifikasi hanya jika user berbeda
		if (targetUserId && likeId && targetUserId !== userId) {
			console.log('ada targetUserId');

			console.log('jalankan getTargetUser');
			targetUser = (await getTargetUser(targetUserId)) as unknown as TargetUser;

			console.info({ targetUser });

			if (postId) {
				console.log('jalankan createNotification');
				console.info({ likeId });
				await createNotification({
					targetUserId,
					actorId: userId,
					type: commentId ? 'LIKE_COMMENT' : 'LIKE_POST',
					commentId,
					postId,
					likeId,
				});
			}

			// 5️⃣ Hitung jumlah notifikasi yang belum dibaca **setelah transaksi selesai**
			unreadCount = (await getUnreadNotification(
				targetUserId
			)) as unknown as number;

			console.info({ unreadCount });
		}

		return NextResponse.json(
			{
				unreadCount,
				targetUser,
				type: postId ? 'LIKE_POST' : 'LIKE_COMMENT',
				success: true,
			},
			{ status: 200 }
		);
	} catch (error) {
		if (error instanceof Error) {
			console.info(error.message);
		}
		return NextResponse.json({ error, success: false }, { status: 500 });
	}
};

export const DELETE = async (request: NextRequest) => {
	try {
		const { userId, postId, commentId } = await request.json();

		if (!userId || (!postId && !commentId)) {
			return NextResponse.json(
				{ success: false, message: 'Invalid data' },
				{ status: 400 }
			);
		}

		let unreadCount: number = 0;
		// 3️⃣ Ambil userId pemilik post/comment
		let targetUserId: string | null = null;
		let targetUser: TargetUser | null = null;

		// Gunakan transaksi agar penghapusan like dan notifikasi dilakukan bersama
		await prisma.$transaction(async (prisma) => {
			// Hapus like dari post atau comment
			await prisma.like.deleteMany({
				where: {
					userId,
					postId: postId || undefined,
					commentId: commentId || undefined,
				},
			});

			if (postId) {
				const post = await prisma.post.findUnique({
					where: { id: postId },
					select: { userId: true },
				});
				targetUserId = post?.userId || null;
			} else if (commentId) {
				const comment = await prisma.comment.findUnique({
					where: { id: commentId },
					select: { userId: true },
				});
				targetUserId = comment?.userId || null;
			}
		});

		if (targetUserId) {
			targetUser = (await getTargetUser(targetUserId)) as unknown as TargetUser;
			unreadCount = (await getUnreadNotification(
				targetUserId
			)) as unknown as number;
		} else {
			console.error('targetUserId is undefined or empty');
		}

		return NextResponse.json({
			unreadCount,
			targetUser,
			type: postId ? 'LIKE_POST' : 'LIKE_COMMENT',
			success: true,
		});
	} catch (error) {
		return NextResponse.json({ error, success: false }, { status: 500 });
	}
};
