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
	debug: false,
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
			const email = profile?.email || (credentials?.email as string);
			const existingUser = await prisma.user.findUnique({ where: { email } });

			if (existingUser) {
				// Cek apakah akun provider sudah ada di tabel Account
				const providerAccount = await prisma.account.findFirst({
					where: {
						userId: existingUser.id,
						provider: account?.provider,
					},
				});

				if (!providerAccount) {
					// Jika akun provider belum terhubung, hubungkan ke user yang sudah ada
					await prisma.account.create({
						data: {
							user: { connect: { id: existingUser.id } },
							provider: account?.provider as string,
							providerAccountId: profile?.sub || `credentials-${email}`,
							type: account?.type as string,
							access_token: account?.access_token,
							expires_at: account?.expires_at,
						},
					});
				}

				return true; // Login berhasil
			}

			return true;
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
