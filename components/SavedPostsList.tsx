'use client';

import { Post, SavedPost } from '@/types';
import React from 'react';
import PostCard from './PostCard';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Toast } from '@/lib/sweetalert';

export const SavedPostsList = ({
	savedPosts,
	userId,
}: {
	savedPosts: SavedPost[];
	userId: string;
}) => {
	const queryClient = useQueryClient();

    const getSavedPosts = useQuery({
        queryKey: ['saved-posts', userId],
        queryFn: async () => {
            const response = await axios.get(`/api/user/${userId}/saved-posts`);
            return response.data.savedPosts;
        },
        initialData: savedPosts
    })

	const remove = useMutation({
		mutationKey: ['saved-posts', userId],
		mutationFn: async (id:string) => {
			const response = await axios.delete(`/api/saved-post/${id}`);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['saved-posts', userId],
			});

            Toast.fire('Saved post removed successfully', '', 'success');
		},
		onError: () => {
			Swal.fire('Error', 'Failed to remove saved post', 'error');
		},
	});

	const handleRemove = (id:string) => {
        Swal.fire({
            title:'Are you sure?',
            text:"You won't be able to revert this!",
            icon:'warning',
            showCancelButton:true,
            confirmButtonText:'Yes, delete it!',
            showLoaderOnConfirm:true,
        }).then((result) => {
            if (result.isConfirmed) {
                remove.mutate(id)
            }
        })
    };

	if (savedPosts.length === 0) {
		return (
			<div>
				<div className="text-center text-slate-400">No saved posts yet</div>
			</div>
		);
	}

	return (
		<div>
			{getSavedPosts.data.map((savedPost: SavedPost) => (
				<PostCard
					key={savedPost.id}
					size="small"
					post={savedPost.post as unknown as Post}
					mode="saved-post"
					onRemove={() => handleRemove(savedPost.id)}
				/>
			))}
		</div>
	);
};
