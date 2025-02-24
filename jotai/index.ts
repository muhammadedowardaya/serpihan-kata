import { Comment, PostAtom, Tag } from '@/types';
import { atom } from 'jotai';
import { atomWithStorage, loadable } from 'jotai/utils';
import { User } from 'next-auth';

export const subscriptionAtom = atomWithStorage<PushSubscription | null>(
	'subscription',
	null
);
export const userAtom = atomWithStorage<User | null>('user', null);

export const filterByTagsAtom = atom<Tag[]>([]);

export const showReplyInputAtom = atom<{
	[key: string]: boolean;
}>({});

export const alertAuthAtom = atom<{
	title: string;
	description?: React.ReactNode;
	type: 'error' | 'success' | 'warning' | 'info';
	textConfirmButton: string;
} | null>(null);
export const showModalAuthAtom = atom(false);
export const hasAccountAtom = atom(true);

export const editPostIdAtom = atomWithStorage('editPostId', '');
export const editProfileAtom = atom(false);

export const postIdAtom = atomWithStorage('postId', '');
export const asyncPostIdAtom = atom(async (get) => get(postIdAtom));
export const loadablePostId = loadable(asyncPostIdAtom);

export const replyToAtom = atom<Comment | null>(null);
export const asyncReplyToAtom = atom(async (get) => get(replyToAtom));
export const loadableReplyTo = loadable(asyncReplyToAtom);

export const showPostCommentAtom = atom(false);

export const alertPostCommentAtom = atom<{
	title: string;
	description?: React.ReactNode;
	type: 'error' | 'success' | 'warning' | 'info';
	textConfirmButton?: string;
	textCancelButton?: string;
	onConfirm?: () => void;
	onCancel?: () => void;
	isLoadingConfirm?: boolean;
} | null>(null);

export const alertPostContentAtom = atom<{
	title: string;
	description: string;
	type: string;
} | null>(null);

export const showInputCommentAtom = atom(false);
export const successMessageAtom = atom('');
export const errorMessageAtom = atom('');
export const progressAtom = atom(0);

const defaultPostData: PostAtom = {
	slug: '',
	title: '',
	description: '',
	content: '',
	thumbnail: null,
	thumbnailFileName: '',
	thumbnailPreview: '',
	userId: '',
	tags: [],
};

// Atom utama untuk menyimpan data post
export const postDataAtom = atomWithStorage<PostAtom>(
	'postData',
	defaultPostData
);

// Atom async untuk mendapatkan postData
export const asyncPostDataAtom = atom<Promise<PostAtom>>(async (get) =>
	get(postDataAtom)
);
export const loadablePostData = loadable<Promise<PostAtom>>(asyncPostDataAtom);

// Atom untuk mereset postData ke nilai default
export const resetPostDataAtom = atom(null, (_get, set) => {
	set(postDataAtom, defaultPostData);
});
