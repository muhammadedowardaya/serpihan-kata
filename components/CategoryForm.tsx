import React from 'react';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from './ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { categorySchema } from '@/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Toast } from '@/lib/sweetalert';
import Swal from 'sweetalert2';

export const CategoryForm = ({ onDone }: { onDone: () => void }) => {
	const queryClient = useQueryClient();

	const mutation = useMutation<unknown, Error, { category: string }>({
		mutationFn: async (data) => {
			const response = await axios.post('/api/category', data, {
				headers: {
					'Content-Type': 'application/json',
				},
			});
			return response.data;
		},
		onSuccess: () => {
            if (onDone) onDone();

			queryClient.invalidateQueries({
				queryKey: ['categories'],
			});

			Toast.fire({
				title: 'Category created successfully',
				icon: 'success',
			});

		},
		onError: (error) => {
            if (onDone) onDone();

			if (axios.isAxiosError(error)) {
				const errorMessage =
					error.response?.data?.error || 'An unexpected error occurred';
				Swal.fire('Failed', errorMessage, 'error');
			} else {
				// Penanganan untuk error non-Axios
				Swal.fire(
					'Failed',
					error.message || 'An unknown error occurred',
					'error'
				);
			}
		},
	});

	const form = useForm<z.infer<typeof categorySchema>>({
		resolver: zodResolver(categorySchema),
		defaultValues: {
			category: '',
		},
	});

	const onSubmit = (data: z.infer<typeof categorySchema>) => {
		mutation.mutate(data);
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-8 px-4 md:px-0"
			>
				<FormField
					control={form.control}
					name="category"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Category</FormLabel>
							<FormControl>
								<Input
									placeholder="type here..."
									autoComplete="off"
									disabled={mutation.isPending}
									{...field}
								/>
							</FormControl>
							<FormDescription>Type your name of category</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button
					type="submit"
					className="w-full block"
					disabled={mutation.isPending}
				>
					{mutation.isPending ? 'Saving...' : 'Save'}
				</Button>
			</form>
		</Form>
	);
};
