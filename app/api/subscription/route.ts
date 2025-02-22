import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const POST = async (req: Request) => {
	try {
		const { endpoint, keys } = await req.json();

		if (!endpoint || !keys?.p256dh || !keys?.auth) {
			return NextResponse.json(
				{ error: 'Invalid subscription data' },
				{ status: 400 }
			);
		}

		await prisma.pushSubscription.upsert({
			where: { endpoint },
			update: { keys },
			create: { endpoint, keys },
		});

		return NextResponse.json(
			{ message: 'Subscription saved successfully' },
			{ status: 201 }
		);
	} catch (error) {
		console.error('Error saving subscription');
		if (error instanceof Error) {
			console.error(error.message);
		}

		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
};
