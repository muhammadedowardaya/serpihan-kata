'use client';

import React, { useState } from 'react';
import { Comment } from '@/types';
import { useSetAtom } from 'jotai';
import { replyToAtom } from '@/jotai';
import { Button } from './ui/button';
import { MyAlert } from './MyAlert';
import { useSession } from 'next-auth/react';

export const CommentReplyButton = ({
	comment,
	parentId,
}: {
	comment: Comment;
	parentId?: string;
}) => {
	const { data: session } = useSession();
	const setReplyTo = useSetAtom(replyToAtom);

	const [alert, setAlert] = useState<{
		title: string;
		description: string;
		type: string;
		onConfirm: () => void;
	} | null>(null);

	const handleOnClick = () => {
		if (!session?.user) {
			setAlert({
				title: 'Login Required',
				description: 'You must login to reply a comment',
				type: 'warning',
				onConfirm: () => setAlert(null),
			});
			return;
		}

		setReplyTo({ ...comment, parentId });
	};

	return (
		<>
			<Button
				variant="ghost"
				className="flex group items-center gap-1 cursor-pointer h-max w-max p-0 m-0"
				onClick={handleOnClick}
				aria-label={`Reply to ${comment?.user?.username}`}
				aria-describedby={comment.id} // Menghubungkan tombol dengan komentar terkait
			>
				<span className="text-xs select-none group-hover:text-yellow-200">
					Reply
				</span>
			</Button>
			<MyAlert
				open={!!alert}
				type="warning"
				title={alert?.title as string}
				description={<span>{alert?.description}</span>}
				textConfirmButton="OK"
				onConfirm={alert?.onConfirm as VoidFunction}
			/>
		</>
	);
};
