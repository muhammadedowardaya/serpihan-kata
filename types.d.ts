import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
	/**
	 * The shape of the user object returned in the OAuth providers' `profile` callback,
	 * or the second parameter of the `session` callback, when using a database.
	 */
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
		socialMediaId?: string;
		socialMedia?: SocialMedia;
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
		user: User & DefaultSession['user'];
	}
}

// The `JWT` interface can be found in the `next-auth/jwt` submodule
// import { JWT } from 'next-auth/jwt';

declare module 'next-auth/jwt' {
	/** Returned by the `jwt` callback and `auth`, when using JWT sessions */
	interface JWT {
		user: User;
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
	isDraft: boolean;
	slug: string;
	title: string;
	description: string;
	content: string;
	thumbnail: File | null | string;
	thumbnailFileName: string;
	thumbnailPreview: string;
	createdAt: Date;
	views?: number;
	likes: Like[];
	postTag: PostTag[];
	comments?: Comment[];
	userId: string;
	user: User;
}

interface PostAtom {
	slug: string;
	title: string;
	description: string;
	content: string;
	thumbnail: File | null | string;
	thumbnailFileName: string;
	thumbnailPreview: string;
	userId: string;
	tags: Tag[];
}

interface SavedPost {
	id: string;
	postId: string;
	post: Post;
	userId: string;
	user: User;
}

interface Tag {
	id: string;
	label: string;
	value: string;
}

interface PostTag {
	postId: string;
	tagId: string;
	post: Post;
	tag: Tag;
}

interface Comment {
	id: string;
	message: string;
	likes: Like[];
	user: User;
	postId?: string;
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

interface TargetUser {
	id: string;
	username: string;
	image: string;
}

interface AlertPostComment {
	title: string;
	description?: React.ReactNode;
	type: 'error' | 'success' | 'warning' | 'info';
	textConfirmButton?: string;
	textCancelButton?: string;
	onConfirm?: () => void;
	onCancel?: () => void;
	isLoadingConfirm?: boolean;
}
