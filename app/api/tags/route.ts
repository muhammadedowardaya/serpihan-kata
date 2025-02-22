import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import slugify from 'slugify';

export const GET = async () => {
	try {
		const tags = await prisma.tag.findMany();
		return NextResponse.json({ tags }, { status: 200 });
	} catch (error) {
		console.info(error);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
};

export const POST = async (request: Request) => {
	try {
		const session = await auth();
		const userId = session?.user?.id;
		const { label } = await request.json();

		const value = slugify(label, {
			lower: true,
			replacement: '_',
		});

		const existingTag = await prisma.tag.findUnique({
			where: { label },
		});

		if (existingTag) {
			return NextResponse.json(
				{
					tag: existingTag,
				},
				{
					status: 200,
				}
			);
		}

		const tag = await prisma.tag.create({
			data: {
				label: label,
				value: value,
			},
		});

		return NextResponse.json({ tag }, { status: 200 });
        
	} catch (error) {
		console.info(error);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
};
