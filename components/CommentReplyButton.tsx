'use client';

import React from 'react';
import { Comment } from '@/types';
import { useSetAtom } from 'jotai';
import { replyToAtom } from '@/jotai';
import { Button } from './ui/button';

export const CommentReplyButton = ({
	comment,
	parentId,
}: {
	comment: Comment;
	parentId?: string;
}) => {
	const setReplyTo = useSetAtom(replyToAtom);

	return (
		<Button
			variant="ghost"
			className="flex items-center gap-1 cursor-pointer h-max w-max p-0 m-0"
			onClick={() => setReplyTo({ ...comment, parentId })}
			aria-label={`Reply to ${comment?.user?.username}`}
			aria-describedby={comment.id} // Menghubungkan tombol dengan komentar terkait
		>
			<span className="text-xs select-none">
				Reply
			</span>
		</Button>
	);
};
