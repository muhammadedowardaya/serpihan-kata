import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

interface LikePayload {
	userId: string;
	postId?: string | null;
	commentId?: string | null;
}

export const useLike = () => {
	const queryClient = useQueryClient();

	// Fetch Likes
	// const getLikes = useQuery({
	// 	queryKey: ['likes', { postId, commentId }],
	// 	queryFn: async () => {
	// 		const response = await axios.get('/api/likes', {
	// 			params: { postId, commentId },
	// 		});
	// 		return response.data.likes;
	// 	},
	// 	enabled: !!postId || !!commentId, // Hanya fetch jika ada `postId` atau `commentId`
	// });

	// Add Like
	const addLike = useMutation({
		mutationFn: async ({ userId, postId, commentId }: LikePayload) => {
			const { data } = await axios.post('/api/like', {
				userId,
				postId,
				commentId,
			});

			return data;
		},
		onSuccess: () => {
			console.info('success addLike');
			queryClient.invalidateQueries({
				queryKey: ['isLiked'],
			});
		},
	});

	// Remove Like
	const removeLike = useMutation({
		mutationFn: async ({ userId, postId, commentId }: LikePayload) => {
			const { data } = await axios.delete('/api/like', {
				data: { userId, postId, commentId },
			});
			return data;
		},
		onSuccess: () => {
			console.info('success removeLike');
			queryClient.invalidateQueries({
				queryKey: ['isLiked'],
			});
		},
	});

	return { addLike, removeLike };
};
