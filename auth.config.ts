import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import type { NextAuthConfig } from 'next-auth';

export default {
	providers: [GitHub, Google],
	secret: process.env.AUTH_SECRET,
	callbacks: {
		jwt({ token, user }) {
			if (user) {
				token.id = user.id;
				token.username = user.username;
				token.role = user.role;
			}
			return token;
		},
		session({ session, token }) {
			session.user.id = token.id as string;
			session.user.username = token.username as string;
			session.user.role = token.role as 'ADMIN' | 'USER';
			return session;
		},
	},
} satisfies NextAuthConfig;
