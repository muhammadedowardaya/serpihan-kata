import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';

import type { NextAuthConfig } from 'next-auth';
import { prisma } from './lib/prisma';

import { compare } from 'bcryptjs';

import { CredentialsSignin } from 'next-auth';

class NoUserError extends CredentialsSignin {
	code = 'No user found with this email.';
}

class InvalidCredentialsError extends CredentialsSignin {
	code = 'Invalid credentials.';
}

export default {
	debug: true,
	providers: [
		GitHub,
		Google,
		Credentials({
			name: 'Credentials',
			credentials: {
				email: { label: 'Email', type: 'text' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					throw new Error('Missing credentials');
				}

				// Cari user di database berdasarkan email
				const user = await prisma.user.findUnique({
					where: { email: credentials.email as string },
					include: {
						socialMedia: {
							select: {
								instagram: true,
								facebook: true,
								github: true,
								linkedin: true,
								tiktok: true,
								youtube: true,
								other: true,
							},
						},
					},
				});

				if (!user) {
					throw new NoUserError();
				}

				// Periksa apakah password cocok
				const isPasswordValid = await compare(
					credentials.password as string,
					user.password as string
				);
				if (!isPasswordValid) {
					throw new InvalidCredentialsError();
				}

				// Pastikan tipe data cocok dengan User
				return {
					id: user.id,
					username: user.username,
					role: user.role,
					socialMedia: user.socialMedia ?? {}, // Pastikan tidak undefined
				};
			},
		}),
	],
	callbacks: {
		async signIn({ account, profile, credentials }) {
			const email =
				(profile?.email as string) || (credentials?.email as string);

			const existingUser = await prisma.user.findUnique({
				where: { email },
			});

			if (account?.provider !== 'credentials') {
				if (existingUser) {
					// Cek apakah akun provider sudah terkait
					const providerAccount = await prisma.account.findFirst({
						where: {
							userId: existingUser.id,
							provider: account?.provider,
						},
					});

					if (!providerAccount) {
						// Tambahkan akun provider ke tabel account
						await prisma.account.create({
							data: {
								userId: existingUser.id,
								type: account?.type as string,
								provider: account?.provider as string,
								providerAccountId: account?.providerAccountId as string,
								access_token: account?.access_token,
								refresh_token: account?.refresh_token,
								expires_at: account?.expires_at,
							},
						});
					}

					// **Pastikan socialMediaId diisi dengan email**
					if (!existingUser.socialMediaId) {
						await prisma.socialMedia.create({
							data: {
								id: email,
							},
						});

						await prisma.user.update({
							where: { id: existingUser.id },
							data: { socialMediaId: email },
						});
					}

					return true; // Login berhasil
				}

				return true;
			}

			// Jika menggunakan credentials
			if (account?.provider === 'credentials' && existingUser) {
				// Tambahkan akun credentials jika belum ada
				const existingAccount = await prisma.account.findFirst({
					where: {
						userId: existingUser.id,
						provider: 'credentials',
					},
				});

				if (!existingAccount) {
					try {
						await prisma.account.upsert({
							where: {
								userId: existingUser.id, // Cari berdasarkan userId
							},
							update: {
								provider: 'credentials',
								providerAccountId: `credentials-${existingUser.email}`,
							},
							create: {
								user: {
									connect: { id: existingUser.id }, // Hubungkan dengan user yang sudah ada
								},
								type: 'credentials',
								provider: 'credentials',
								providerAccountId: `credentials-${existingUser.email}`,
							},
						});
					} catch (error) {
						if (error instanceof Error) {
							console.error(error.message);
						}

						return false;
					}
				}

				return true;
			}

			return true; // Lanjutkan proses login
		},

		jwt({ token, user, trigger, session }) {
			if (user) {
				token.id = user.id;
				token.username = user.username;
				token.role = user.role;
			}

			if (trigger === 'update') {
				if (session) {
					token.username = session.user.username;
				}
			}

			return token;
		},

		session({ session, token }) {
			if (token) {
				session.user.id = token.id as string;
				session.user.username = token.username as string;
				session.user.role = token.role as 'ADMIN' | 'USER';
			}

			return session;
		},
	},
	secret: process.env.AUTH_SECRET,
	pages: {
		signIn: '/',
		error: '/',
	},
} satisfies NextAuthConfig;
