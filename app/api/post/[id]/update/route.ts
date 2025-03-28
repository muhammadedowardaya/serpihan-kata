import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

import fs from 'fs';
import path from 'path';
import { auth } from '@/auth';
import slugify from 'slugify';
import { saveImage } from '@/lib/save-image';

const cleanupUnusedImages = async (content: string, postId: string) => {
	// Ambil semua URL gambar dari konten
	const imageUrls = Array.from(
		content.matchAll(/<img[^>]+src="([^">]+)"/g)
	).map((match) => match[1]);

	// Ambil semua gambar yang terkait dengan user atau postingan di database
	const usedImages = await prisma.image.findMany({
		where: {
			OR: [{ url: { in: imageUrls } }],
		},
		select: { url: true },
	});

	const usedImageUrls = usedImages.map((img) => img.url);

	// Dapatkan semua gambar di folder uploads
	const uploadsDir = path.join(process.cwd(), `public/uploads/${postId}`);
	const uploadedFiles = fs
		.readdirSync(uploadsDir)
		.map((file) => `/uploads/${postId}/${file}`);

	// Cari gambar yang tidak digunakan dalam konten atau database
	const unusedImages = uploadedFiles.filter(
		(file) => !usedImageUrls.includes(file)
	);

	// Hapus gambar yang tidak digunakan
	unusedImages.forEach((unusedImage) => {
		const filePath = path.join(
			uploadsDir,
			unusedImage.replace(`/uploads/${postId}`, '')
		);
		if (fs.existsSync(filePath)) {
			fs.unlinkSync(filePath);
		}
	});
};

export const PUT = async (
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) => {
	const session = await auth();

	const formData = await request.formData();

	const id = (await params).id;
	const title = formData.get('title') as string;
	const description = formData.get('description') as string;
	const content = formData.get('content') as string;
	const oldThumbnail = formData.get('oldThumbnail') as string;
	const thumbnail = formData.get('thumbnail');
	const tags = JSON.parse(formData.get('tags') as string) as {
		label: string;
		value: string;
	}[];

	const userId = session?.user?.id;

	try {
		const existingPost = await prisma.post.findUnique({
			where: {
				id,
			},
			select: {
				slug: true,
				userId: true,
			},
		});

		const slug = slugify(title, {
			lower: true,
			replacement: '-',
		});

		if (existingPost?.slug === slug && existingPost.userId !== userId) {
			return NextResponse.json(
				{ message: 'Post title already exists' },
				{ status: 400 }
			);
		}

		cleanupUnusedImages(content, id);

		// Simpan gambar di folder upload
		let thumbnailUrl: string = '';

		if (typeof thumbnail === 'object') {
			const thumbnailImage = await saveImage(thumbnail as File, id);
			if (thumbnailImage.success) {
				const oldThumbnailPath = path.join(
					process.cwd(),
					`public/${oldThumbnail}`
				);

				if (fs.existsSync(oldThumbnailPath)) {
					fs.unlinkSync(oldThumbnailPath);
				}

				thumbnailUrl = thumbnailImage.url as string;
				console.info('thumbnailUrl ketika sukses : ', thumbnailUrl);
			} else {
				console.info('image gagal, periksa saveImage pada thumbnailImage');
			}
		} else if (typeof thumbnail === 'string') {
			thumbnailUrl = thumbnail;
			console.info('thumbnail tidak berubah');
		}

		await prisma.$transaction(async (tx) => {
			// Hapus tag yang tidak memiliki post terkait
			await tx.tag.deleteMany({
				where: {
					postTags: {
						none: {}, // Tag yang tidak memiliki postTag
					},
				},
			});

			// update konten ke database
			await prisma.post.update({
				where: { id },
				data: {
					title,
					slug,
					description,
					content,
					thumbnail: thumbnailUrl,
					user: {
						connect: {
							id: userId,
						},
					},
					postTag: {
						deleteMany: {}, // Hapus semua relasi postTag sebelum update
						create: tags.map((tag) => ({
							tag: {
								connectOrCreate: {
									where: { value: tag.value },
									create: { label: tag.label, value: tag.value },
								},
							},
						})),
					},
				},
			});
		});

		return NextResponse.json(
			{ message: 'Post updated successfully' },
			{ status: 201 }
		);
	} catch (error) {
		return NextResponse.json(
			{
				message: 'Failed to update post',
				error: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
};
