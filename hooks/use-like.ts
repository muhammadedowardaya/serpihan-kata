import { socket } from '@/socket-client';
import { TargetUser } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { usePathname } from 'next/navigation';

interface LikePayload {
	userId: string;
	postId?: string | null;
	commentId?: string | null;
}

interface LikeResponse {
	unreadCount: number;
	targetUser: TargetUser;
	type: 'LIKE_POST' | 'LIKE_COMMENT';
}

export const useLike = () => {
	const queryClient = useQueryClient();

	const pathname = usePathname();
	const origin = typeof window !== 'undefined' ? window.location.origin : '';

	// Add Like
	const addLike = useMutation<LikeResponse, Error, LikePayload>({
		mutationFn: async ({ userId, postId, commentId }: LikePayload) => {
			// Cek apakah like sudah ada sebelum dikirim ke backend
			const { data } = await axios.get(`/api/post/${postId}/isLiked`);

			if (data?.isLiked) {
				throw new Error('You already liked this post');
			}

			// Jika belum ada, lakukan like
			const res = await axios.post('/api/like', { userId, postId, commentId });
			return res.data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['isLiked'] });
			console.info('data setelah like', data);
			if (data?.unreadCount) {
				socket.emit('unreadCount', {
					unreadCount: data.unreadCount,
					userId: data.targetUser.id,
				});

				const message =
					data.type === 'LIKE_POST' ? 'liked your post' : 'liked your comment';

				socket.emit('sendNotification', {
					targetUser: data.targetUser,
					message,
					url: `${origin}${pathname}`,
				});
			}
		},
	});

	// Remove Like
	const removeLike = useMutation<LikeResponse, Error, LikePayload>({
		mutationFn: async ({ userId, postId, commentId }: LikePayload) => {
			const response = await axios.delete('/api/like', {
				data: { userId, postId, commentId },
			});
			return response.data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: ['isLiked'],
			});

			if (data?.unreadCount) {
				console.info('data setelah dislike', data);

				socket.emit('unreadCount', {
					unreadCount: data.unreadCount,
					userId: data.targetUser.id,
				});
			}
		},
	});

	return { addLike, removeLike };
};
