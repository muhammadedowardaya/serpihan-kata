import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
	/**
	 * The shape of the user object returned in the OAuth providers' `profile` callback,
	 * or the second parameter of the `session` callback, when using a database.
	 */
	interface User {
		id: string;
		username: string;
		role: 'ADMIN' | 'USER';
	}
	/**
	 * The shape of the account object returned in the OAuth providers' `account` callback,
	 * Usually contains information about the provider being used, like OAuth tokens (`access_token`, etc).
	 */
	// interface Account {}

	/**
	 * Returned by `useSession`, `auth`, contains information about the active session.
	 */
	interface Session {
		user: {
			id: string;
			role: 'ADMIN' | 'USER';
		} & DefaultSession['user'];
	}
}

// The `JWT` interface can be found in the `next-auth/jwt` submodule
// import { JWT } from 'next-auth/jwt';

declare module 'next-auth/jwt' {
	/** Returned by the `jwt` callback and `auth`, when using JWT sessions */
	interface JWT {
		/** OpenID ID Token */
		user: {
			id?: string;
			role?: 'ADMIN' | 'USER';
		};
	}
}

interface Like {
	id: string;
	userId: string;
	user: User;
	postId?: string;
	post?: Post;
	commentId?: string;
	comment?: Comment;
}

interface User {
	id: string;
	name: string;
	username?: string;
	email?: string;
	image?: string;
	bio?: string;
	role: 'USER' | 'ADMIN';
	posts: Post[];
	comments: Comment[];
	likes: Like;
}

interface SocialMedia {
	facebook?: string;
	instagram?: string;
	linkedin?: string;
	tiktok?: string;
	youtube?: string;
	github?: string;
	other?: string;
}

interface Post {
	id: string;
	slug: string;
	title: string;
	description: string;
	content: string;
	thumbnail: File | null | string;
	thumbnailFileName: string;
	thumbnailPreview: string;
	createdAt: Date;
	views?: number;
	categoryId: string;
	category: Category;
	comments?: Comment[];
	userId: string;
	user: User;
}

interface PostAtom {
	id: string;
	slug: string;
	title: string;
	description: string;
	content: string;
	thumbnail: File | null | string;
	thumbnailFileName: string;
	thumbnailPreview: string;
	categoryId: string;
	userId: string;
}

interface SavedPost {
	id: string;
	postId: string;
	post: Post;
	userId: string;
	user: User;
}

interface Category {
	id: string;
	label: string;
	value: string;
}

interface Comment {
	id: string;
	message: string;
	likes: Like[];
	user: User;
	post: Post;
	parentId?: string;
	parent?: Comment;
	replies?: Comment[];
	replyToId?: string;
	replyTo?: Comment;
	specificReplies?: Comment[];
	createdAt: Date;
	updatedAt: Date;
}
