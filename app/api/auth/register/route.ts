import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';

export const POST = async (request: NextRequest) => {
	try {
		const { name, username, email, password } = await request.json();

		// Cek apakah email atau username sudah ada
		const existingUser = await prisma.user.findFirst({
			where: {
				OR: [{ email: email }, { username: username }],
			},
		});

		if (existingUser) {
			// Tentukan pesan error spesifik
			const errorMessage =
				existingUser.email === email
					? 'Email already exists.'
					: 'Username already exists.';
			return NextResponse.json({ error: errorMessage, status: 400 });
		}

		// Hash password sebelum menyimpan ke database
		const hashedPassword = await hash(password, 10);

		// Buat user baru
		const newUser = await prisma.user.create({
			data: {
				name,
				username,
				email,
				password: hashedPassword, // Simpan password yang sudah di-hash
				socialMedia: {
					connectOrCreate: {
						where: {
							id: email,
						},
						create: {
							id: email,
						},
					},
				},
				account: {
					create: {
						provider: 'credentials',
						providerAccountId: `credentials-${email}`,
						type: 'credentials',
					},
				},
			},
		});

		return NextResponse.json({ user: newUser, status: 201 });
	} catch (error) {
		if (error instanceof Error) {
			console.error('Error creating user:', error.message);
		}
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
};
