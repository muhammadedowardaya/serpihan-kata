import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { saveUserImage } from '@/lib/save-user-image';
import { SocialMedia } from '@/types';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async () => {
	console.info('GET /api/user');

	try {
		const session = await auth();
		const id = session ? session?.user?.id : null;

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
	}
};

export const PATCH = async (request: NextRequest) => {
	try {
		const session = await auth();
		const id = session?.user?.id as string;
		const email = session?.user?.email as string;

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
		const other = formData.get('other') as string;

		const socialMediaData: SocialMedia = {};

		if (facebook) socialMediaData.facebook = facebook;
		if (instagram) socialMediaData.instagram = instagram;
		if (linkedin) socialMediaData.linkedin = linkedin;
		if (tiktok) socialMediaData.tiktok = tiktok;
		if (youtube) socialMediaData.youtube = youtube;
		if (github) socialMediaData.github = github;
		if (other) socialMediaData.other = other;

		if (!id) {
			return NextResponse.json(
				{
					error: 'Unauthorized',
					success: false,
				},
				{ status: 401 }
			);
		}

		if (username) {
			const existingUser = await prisma.user.findUnique({
				where: { username },
			});

			if (existingUser && existingUser.id !== id) {
				return NextResponse.json(
					{
						error: 'Username already exists.',
						success: false,
					},
					{ status: 409 } // 409 Conflict
				);
			}
		}

		let imageUrl = '';

		if (typeof image === 'object') {
			const saveImageResult = await saveUserImage(image as File, username);

			if (saveImageResult.success) {
				imageUrl = saveImageResult.url as string;
			}
		} else {
			imageUrl = image as string;
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
		if (imageUrl !== '') data.image = imageUrl;
		data.bio = bio;

		const user = await prisma.user.update({
			where: { id },
			data,
		});

		const existingSocialMedia = await prisma.socialMedia.findUnique({
			where: {
				id: email as string,
			},
		});

		if (existingSocialMedia) {
			await prisma.socialMedia.update({
				where: {
					id: email as string,
				},
				data: {
					...socialMediaData,
				},
			});
		}

		return NextResponse.json(
			{
				user,
				success: true,
			},
			{ status: 200 }
		);
	} catch (error) {
		if (error instanceof Error) {
			console.info(error.message);
		}

		return NextResponse.json(
			{
				error: 'Something went wrong',
				success: false,
			},
			{ status: 500 }
		);
	}
};
