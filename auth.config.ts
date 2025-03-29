import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';

import type { NextAuthConfig } from 'next-auth';
import { prisma } from './lib/prisma';

import { compare } from 'bcryptjs';

import { CredentialsSignin } from 'next-auth';
import redis from './lib/redis';
import { User } from 'next-auth';

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
				return user as User;
			},
		}),
	],
	callbacks: {
		async signIn({ account, profile, credentials }) {
			const email = profile?.email || (credentials?.email as string);
			if (!email) return false; // Hindari error jika email tidak ditemukan

			const existingUser = await prisma.user.findUnique({
				where: { email },
				include: { account: true }, // Ambil semua akun provider user ini
			});

			if (existingUser) {
				console.log('User ditemukan:', existingUser);
				console.log('Account ditemukan:', account);

				if (!existingUser.account?.provider) {
					console.log('Menambahkan provider baru ke akun yang sudah ada.');
					try {
						await prisma.account.create({
							data: {
								userId: existingUser.id,
								provider: account?.provider as string,
								providerAccountId: profile?.sub || `credentials-${email}`,
								type: account?.type as string,
								access_token: account?.access_token,
								expires_at: account?.expires_at,
							},
						});
					} catch (error) {
						console.error('Gagal menambahkan provider:', error);
						return false; // Gagal login jika terjadi error
					}
				} else if (
					(existingUser.account.provider === 'credentials' &&
						account?.provider === 'google') ||
					account?.provider === 'github'
				) {
					try {
						await prisma.account.update({
							where: {
								userId: existingUser.id,
							},
							data: {
								provider: account?.provider as string,
								providerAccountId: profile?.sub || `credentials-${email}`,
								type: account?.type as string,
								access_token: account?.access_token,
								expires_at: account?.expires_at,
							},
						});
					} catch (error) {
						console.error('Gagal menambahkan provider:', error);
						return false; // Gagal login jika terjadi error
					}
				}

				return true; // Login berhasil
			}

			// Jika user belum ada, biarkan NextAuth menangani pembuatan user baru
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

		async session({ session, token }) {
			if (token) {
				session.user.id = token.id as string;
				session.user.username = token.username as string;
				session.user.role = token.role as 'ADMIN' | 'USER';
			}

			const sessionKey = `session:${token.id}`;
			await redis.set(sessionKey, JSON.stringify(session), 'EX', 60 * 60 * 24); // Expire dalam 24 jam

			return session;
		},
	},
	secret: process.env.AUTH_SECRET,
	pages: {
		signIn: '/',
		error: '/',
	},
	events: {
		async signOut(message) {
			if ('token' in message && message.token?.sub) {
				console.log('session dihapus', message.token?.sub);
				const sessionKey = `session:${message.token.sub}`;
				await redis.del(sessionKey);
				console.log(`Session ${sessionKey} berhasil dihapus.`);
			}
		},
	},
} satisfies NextAuthConfig;
