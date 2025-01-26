import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const DELETE = async (
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) => {
	try {
		const id = (await params).id;

		await prisma.savedPost.delete({
			where: {
				id,
			},
		});

		return NextResponse.json({
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
