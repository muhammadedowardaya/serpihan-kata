import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const PATCH = async (
	request: NextRequest,
	{
		params,
	}: {
		params: Promise<{ id: string }>;
	}
) => {
	try {
		const id = (await params).id;
		const { platform } = await request.json();

		const data: Record<string, null> = {};

		if (
			[
				'instagram',
				'facebook',
				'linkedin',
				'tiktok',
				'youtube',
				'github',
				'other',
			].includes(platform)
		) {
			data[platform] = null; // Atau gunakan "" jika ingin string kosong
		}

		const socialMedia = await prisma.socialMedia.update({
			where: {
				id,
			},
			data,
		});

		return NextResponse.json(
			{
				socialMedia,
				success: true,
			},
			{ status: 200 }
		);
	} catch (error) {
		return NextResponse.json(
			{
				error,
				success: false,
			},
			{ status: 500 }
		);
	}
};
