import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import slugify from 'slugify';

export const GET = async () => {
	try {
		const categories = await prisma.category.findMany();
		return NextResponse.json({ categories, status: 200 });
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
		const { category } = await request.json();
		const value = slugify(category, {
			lower: true,
			replacement: '_',
		});

		const existingCategory = await prisma.category.findFirst({
			where: {
				value: value,
			},
		});

		if (existingCategory) {
			return NextResponse.json(
				{ error: 'Category already exists' },
				{ status: 400 }
			);
		}

		const response = await prisma.category.create({
			data: {
				label: category,
				value: value,
			},
		});

		return NextResponse.json({ category: response, status: 200 });
	} catch (error) {
		console.info(error);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
};
