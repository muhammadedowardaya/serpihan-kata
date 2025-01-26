/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { saveUserImage } from '@/lib/save-user-image';
import { SocialMedia } from '@/types';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async () => {
	try {
		const session = await auth();
		const id = session?.user?.id;

		const user = await prisma.user.findUnique({
			where: {
				id,
			},
			include: {
				savedPosts: true,
			},
		});
		return NextResponse.json({ user, status: 200 });
	} catch (error) {
		if (error instanceof Error) {
			console.info(error.message);
		}
	}
};

export const PATCH = async (request: NextRequest) => {
	try {
		const session = await auth();
		const id = session?.user?.id;
		let socialMediaId = '';

		const formData = await request.formData();

		const name = formData.get('name') as string;
		const username = formData.get('username') as string;
		const image = formData.get('image');
		const bio = formData.get('bio') as string;

		const facebook = formData.get('facebook') as string;
		const instagram = formData.get('instagram') as string;
		const linkedin = formData.get('linkedin') as string;
		const tiktok = formData.get('tiktok') as string;
		const youtube = formData.get('youtube') as string;
		const github = formData.get('github') as string;

		const socialMediaData: SocialMedia = {};

		if (facebook) socialMediaData.facebook = facebook;
		if (instagram) socialMediaData.instagram = instagram;
		if (linkedin) socialMediaData.linkedin = linkedin;
		if (tiktok) socialMediaData.tiktok = tiktok;
		if (youtube) socialMediaData.youtube = youtube;
		if (github) socialMediaData.github = github;

		if (!id) {
			return NextResponse.json({
				error: 'Unauthorized',
				success: false,
				status: 401,
			});
		}

		if (username) {
			const existingUser = await prisma.user.findUnique({
				where: { username },
			});

			function isEmptyObject(obj: Record<string, any>) {
				return Object.keys(obj).length === 0;
			}

			if (!isEmptyObject(socialMediaData)) {
				if (!existingUser?.socialMediaId) {
					const socialMedia = await prisma.socialMedia.create({
						data: {
							userId: id,
							...socialMediaData,
						},
					});
					socialMediaId = socialMedia.id;
				} else {
					await prisma.socialMedia.update({
						where: { userId: id },
						data: socialMediaData,
					});
				}
			}

			if (existingUser && existingUser.id !== id) {
				return NextResponse.json({
					error: 'Username already taken',
					success: false,
					status: 400,
				});
			}
		}

		let imageUrl = '';

		if (typeof image === 'object') {
			const saveImageResult = await saveUserImage(image as File, username);

			if (saveImageResult.success) {
				imageUrl = saveImageResult.url as string;
			}
		}

		interface Data {
			name?: string;
			username?: string;
			bio?: string;
			image?: string;
			socialMediaId?: string;
		}

		const data: Data = {};

		if (name) data.name = name;
		if (username) data.username = username;
		if (bio) data.bio = bio;
		if (imageUrl !== '') data.image = imageUrl;
		if (socialMediaId !== '') data.socialMediaId = socialMediaId;

		const user = await prisma.user.update({
			where: { id },
			data,
		});

		return NextResponse.json({
			user,
			success: true,
			status: 200,
		});
	} catch (error) {
		return NextResponse.json({
			error,
			success: false,
			status: 500,
		});
	}
};
