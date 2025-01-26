import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (
	request: NextRequest,
	{
		params,
	}: {
		params: Promise<{ id: string }>;
	}
) => {
	try {
		const id = (await params).id;

		const comment = await prisma.comment.findFirst({
			where: {
				id,
			},
			include: {
				likes: {
					include: {
						user: true,
					},
				},
				user: true,
				parent: {
					include: {
						user: true,
					},
				},
				replies: {
					include: {
						user: true,
						likes: true,
						replyTo: {
							include: {
								user: true,
							},
						},
					},
				},
			},
		});

		// console.info(comment?.replies);

		return NextResponse.json({
			comment,
			success: true,
			status: 200,
		});
	} catch (error) {
		if (error instanceof Error) {
			console.log(error.message);
		}

		return NextResponse.json({
			success: false,
			status: 500,
		});
	}
};

export const DELETE = async (
	request: NextRequest,
	{
		params,
	}: {
		params: Promise<{ id: string }>;
	}
) => {
	try {
		const id = (await params).id;
		const comment = await prisma.comment.delete({
			where: {
				id,
			},
		});

		return NextResponse.json({
			comment,
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
