import { Comment } from '@/types';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import React, { useEffect } from 'react';
import CommentReplyItem from './CommentReplyItem';

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from './ui/accordion';
import { useSearchParams } from 'next/navigation';

export const CommentReplyItemList = ({
	parentId,
	replies,
}: {
	parentId: string;
	replies: Comment[];
}) => {
	const getReplies = useQuery<unknown, Error, Comment[]>({
		queryKey: ['replies', parentId],
		queryFn: async () => {
			const response = await axios.get(`/api/comment/${parentId}/replies`);
			console.info('queryKey replies', parentId);
			return response.data.replies;
		},
		initialData: replies,
		enabled: !!parentId, // Hanya fetch jika ada `postId` atau `commentId`
	});

	const searchParams = useSearchParams();
	const commentId = searchParams.get('comment');

	useEffect(() => {
		if (commentId) {
			const element = document.getElementById(commentId);
			if (element) {
				element.scrollIntoView({ behavior: 'smooth' });
			}
		}
	}, [commentId, getReplies.data]);

	if (getReplies.data.length === 0) return null;

	return (
		<Accordion
			type="single"
			collapsible
			className="ml-6"
			defaultValue={
				commentId && getReplies.data.some((reply) => reply.id === commentId)
					? parentId
					: undefined
			}
		>
			<AccordionItem value={parentId} className="border-none">
				<AccordionTrigger className="pb-0">
					See {getReplies.data.length} replies?
				</AccordionTrigger>
				<AccordionContent className="flex flex-col gap-y-4 mt-4">
					{getReplies.data.map((reply) => (
						<CommentReplyItem
							key={reply.id}
							comment={reply}
							parentId={parentId}
						/>
					))}
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
};
