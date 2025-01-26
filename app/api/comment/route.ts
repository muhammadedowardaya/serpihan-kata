import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const POST = async (request: NextRequest) => {
	try {
		const { userId, postId, replyToId, parentId, message } =
			await request.json();

		const parentIdData = parentId ? parentId : replyToId;
		const replyToIdData = parentId ? replyToId : null;

		// console.info({
		// 	userId,
		// 	postId,
		// 	replyToId,
		//     parentId,
		// 	replyToIdData,
		// 	parentIdData,
		// 	message,
		// });

		const comment = await prisma.comment.create({
			data: {
				userId, // userId akan mengirim sebuah
				message, // komentar
				parentId: parentIdData, // ke komentar orang lain (parentId berisi id komentar orang lain)
				postId, // tentang postingan tertentu
				replyToId: replyToIdData,
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
