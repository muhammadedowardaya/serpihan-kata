import { prisma } from '@/lib/prisma';

export const getTargetUser = async (targetUserId: string) => {
	try {
		const targetUser = await prisma.user.findUnique({
			where: {
				id: targetUserId,
			},
			select: {
				id: true,
				username: true,
				image: true,
			},
		});

		return targetUser;
	} catch (error) {
		if (error instanceof Error) {
			console.error(error.message);
		}
	}
};
