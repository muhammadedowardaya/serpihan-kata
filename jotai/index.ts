import { Comment, PostAtom, User } from '@/types';
import { atom } from 'jotai';
import { atomWithStorage, loadable } from 'jotai/utils';

export const userAtom = atomWithStorage<User | null>('user', null);

export const editPostIdAtom = atom('');
export const editProfileAtom = atom(false);

export const postIdAtom = atomWithStorage('postId', '');
export const asyncPostIdAtom = atom(async (get) => get(postIdAtom));
export const loadablePostId = loadable(asyncPostIdAtom);

export const replyToAtom = atom<Comment | null>(null);
export const asyncReplyToAtom = atom(async (get) => get(replyToAtom));
export const loadableReplyTo = loadable(asyncReplyToAtom);

export const showInputCommentAtom = atom(false);
export const successMessageAtom = atom('');
export const errorMessageAtom = atom('');
export const progressAtom = atom(0);

export const postDataAtom = atomWithStorage<PostAtom>('postData', {
	id: '',
    slug:'',
	title: '',
	description: '',
	content: '',
	thumbnail: null,
	thumbnailFileName: '',
	thumbnailPreview: '',
	categoryId: '',
	userId: '',
});
export const asyncPostDataAtom = atom<Promise<PostAtom>>(async (get) =>
	get(postDataAtom)
);
export const loadablePostData = loadable<Promise<PostAtom>>(asyncPostDataAtom);
