import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import redis from '@/lib/redis';
import { saveUserImage } from '@/lib/save-user-image';
import { SocialMedia } from '@/types';
import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async () => {
	try {
		const session = await auth();
		const id = session ? session?.user?.id : null;

		const cacheKey = `session:${id}`;
		const cachedUser = await redis.get(cacheKey);

		if (cachedUser) {
			return NextResponse.json({ user: cachedUser }, { status: 200 });
		}

		let user;

		if (id) {
			user = await prisma.user.findUnique({
				where: {
					id,
				},
				include: {
					savedPosts: true,
					socialMedia: {
						select: {
							instagram: true,
							facebook: true,
							github: true,
							linkedin: true,
							tiktok: true,
							youtube: true,
							other: true,
						},
					},
				},
			});
		} else {
			user = null;
		}

		return NextResponse.json({ user, status: 200 });
	} catch (error) {
		if (error instanceof Error) {
			console.info(error.message);
		}
		return NextResponse.json(
			{
				error: 'Internal Server Error',
			},
			{
				status: 500,
			}
		);
	}
};

export const PATCH = async (request: NextRequest) => {
	try {
		const session = await auth();
		const id = session?.user?.id;

		if (!id) {
			return NextResponse.json(
				{ error: 'Unauthorized', success: false },
				{ status: 401 }
			);
		}

		const formData = await request.formData();
		const name = formData.get('name') as string;
		const username = formData.get('username') as string;
		const image = formData.get('image');
		const bio = formData.get('bio') as string;

		const socialMediaData: Partial<SocialMedia> = {
			facebook: formData.get('facebook') as string,
			instagram: formData.get('instagram') as string,
			linkedin: formData.get('linkedin') as string,
			tiktok: formData.get('tiktok') as string,
			youtube: formData.get('youtube') as string,
			github: formData.get('github') as string,
			other: formData.get('other') as string,
		};

		// Filter undefined/null dari socialMediaData
		Object.keys(socialMediaData).forEach(
			(key) =>
				socialMediaData[key as keyof SocialMedia] === null &&
				delete socialMediaData[key as keyof SocialMedia]
		);

		// Cek apakah username diubah dan belum digunakan
		if (username) {
			const existingUser = await prisma.user.findUnique({
				where: { username },
			});
			if (existingUser && existingUser.id !== id) {
				return NextResponse.json(
					{ error: 'Username already exists.', success: false },
					{ status: 409 }
				);
			}
		}

		// Handle image upload jika ada file yang diunggah
		let imageUrl: string | undefined;
		if (typeof image === 'object') {
			const saveImageResult = await saveUserImage(image as File, username);
			if (saveImageResult.success) {
				imageUrl = saveImageResult.url;
			}
		} else if (typeof image === 'string') {
			imageUrl = image;
		}

		// Buat objek update data untuk user
		const updateData: Prisma.userUpdateInput = {};
		if (name) updateData.name = name;
		if (username) updateData.username = username;
		if (bio) updateData.bio = bio;
		if (imageUrl) updateData.image = imageUrl;

		// Update user dan social media sekaligus
		const user = await prisma.user.update({
			where: { id },
			data: {
				...updateData,
				socialMedia: {
					update: {
						...Object.fromEntries(
							Object.entries(socialMediaData).filter(([, url]) => url) // Hanya update jika URL tidak kosong
						),
					},
				},
			},
		});

		return NextResponse.json({ user, success: true }, { status: 200 });
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: 'Something went wrong', success: false },
			{ status: 500 }
		);
	}
};
