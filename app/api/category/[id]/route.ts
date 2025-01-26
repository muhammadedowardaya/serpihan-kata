import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import slugify from 'slugify';

export const DELETE = async (
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) => {
	try {
		const id = (await params).id;
		const category = await prisma.category.delete({
			where: {
				id,
			},
		});
		return NextResponse.json({ category, status: 200 });
	} catch (error) {
		if (error instanceof Error) {
			console.info(error.message);
		}
	}
};

export const PUT = async (
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) => {
	try {
		const id = (await params).id;
		const { label } = await request.json();
		const value = slugify(label, {
			lower: true,
		});
		const category = await prisma.category.update({
			where: {
				id,
			},
			data: {
				label,
				value,
			},
		});
		return NextResponse.json({ category, status: 200 });
	} catch (error) {
		return NextResponse.json({ error, status: 500 });
	}
};
