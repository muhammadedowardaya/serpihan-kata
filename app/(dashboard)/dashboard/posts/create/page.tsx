'use client';

import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { postSchema } from '@/schemas';
import React, { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { Button, Flex, Heading } from '@radix-ui/themes';

const QuillEditor = dynamic(() => import('@/components/QuillEditor'), {
	ssr: false,
	loading: () => <div>Loading...</div>,
});

import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';
import Image from 'next/image';
import Swal from 'sweetalert2';
import { Toast } from '@/lib/sweetalert';
import { useAtom, useSetAtom } from 'jotai';
import {
	loadablePostData,
	loadablePostId,
	postDataAtom,
	postIdAtom,
} from '@/jotai';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const CreateNewPostPage = () => {
	const router = useRouter();

	const [postId] = useAtom(loadablePostId);
	const setPostId = useSetAtom(postIdAtom);
	const [postData] = useAtom(loadablePostData);
	const setPostData = useSetAtom(postDataAtom);

	const [previewThumbnail, setPreviewThumbnail] = useState('');

	useEffect(() => {
		if (postId.state === 'hasData') {
			if (!postId) {
				window.location.href = '/dashboard/posts';
			}
		}
	}, [postId]);

	const form = useForm<z.infer<typeof postSchema>>({
		resolver: zodResolver(postSchema),
		defaultValues: {
			title: '',
			description: '',
			content: '',
			categoryId: '',
		},
	});

	const mutation = useMutation<unknown, Error, { id: string; data: FormData }>({
		mutationFn: async ({ id, data }) =>
			await axios.put(`/api/post/${id}`, data).then((res) => res.data),
		onSuccess: () => {
			setPostId('');
			setPostData({
				id: '',
                slug: '',
				title: '',
				description: '',
				content: '',
				thumbnail: null,
				thumbnailPreview: '',
				thumbnailFileName: '',
				categoryId: '',
				userId: '',
			});
			Toast.fire('Post created successfully', '', 'success');
			router.push('/dashboard/posts');
		},
		onError: (error) => {
			Swal.fire('Error', error.message, 'error');
		},
	});

	const categories = useQuery({
		queryKey: ['categories'],
		queryFn: async () => {
			const response = await axios.get('/api/category');
			return response.data.categories;
		},
	});

	const handleOnFieldChange = (name: string, value: string) => {
		setPostData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const restoreFileFromLocalStorage = async (
		thumbnailPreview: string,
		fileName: string
	): Promise<File> => {
		const response = await fetch(thumbnailPreview);
		const blob = await response.blob();
		return new File([blob], fileName, { type: blob.type });
	};

	useEffect(() => {
		const restoreFileOnce = async () => {
			if (postData.state === 'hasData') {
				form.setValue('title', postData.data.title ?? '');
				form.setValue('description', postData.data.description ?? '');
				form.setValue('content', postData.data.content ?? '');
				form.setValue('categoryId', postData.data.categoryId ?? '');
				setPreviewThumbnail(postData.data.thumbnailPreview ?? '');

				if (
					postData.data.thumbnailPreview &&
					postData.data.thumbnail &&
					!fileRestored.current
				) {
					fileRestored.current = true; // Mark as restored
					const file = await restoreFileFromLocalStorage(
						postData.data.thumbnailPreview,
						postData.data.thumbnailFileName
					);
					form.setValue('thumbnail', file ?? null);
					setPostData((prev) => ({
						...prev,
						thumbnail: file,
					}));
				}

				// console.info('data content ', postData.data.content);
			}
		};

		restoreFileOnce();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [postData]);

	// Tambahkan useRef untuk melacak apakah restorasi sudah dilakukan
	const fileRestored = useRef(false);

	const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			if (file.size > 2 * 1024 * 1024) {
				Swal.fire('Error', 'File size exceeds the limit (2MB).', 'error');
				return;
			}

			const reader = new FileReader();

			reader.onload = () => {
				const base64string = reader.result as string;

				setPostData((prev) => ({
					...prev,
					thumbnail: file,
					thumbnailFileName: file.name,
					thumbnailPreview: base64string,
				}));
			};

			reader.readAsDataURL(file);
		}
	};

	const onSubmit = (data: z.infer<typeof postSchema>) => {
		if (postData.state === 'hasData') {
			if (!postData.data.thumbnail) {
				Swal.fire('Warning', 'Please select a thumbnail', 'warning');
				return;
			}
		}

		const formData = new FormData();
		formData.append('title', data.title);
		formData.append('description', data.description);
		formData.append('content', data.content);

		if (postData.state === 'hasData') {
			if (postData.data.thumbnail) {
				formData.append('thumbnail', postData.data.thumbnail);
			}
		}

		formData.append('categoryId', data.categoryId);

		if (postId.state === 'hasData') {
			mutation.mutate({
				id: postId.data,
				data: formData,
			});
		}
	};

	return (
		<div>
			<Heading as="h1" mb="6" mt="6">
				Create New Post
			</Heading>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="w-full max-w-[500px] space-y-8 mb-20"
				>
					<FormField
						control={form.control}
						name="title"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Title</FormLabel>
								<FormControl>
									<Input
										placeholder="type here..."
										{...field}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
											field.onChange(e);
											handleOnFieldChange('title', e.target.value);
										}}
									/>
								</FormControl>
								<FormDescription>Title of the post</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="description"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Description</FormLabel>
								<FormControl>
									<Input
										placeholder="type here..."
										{...field}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
											field.onChange(e);
											handleOnFieldChange('description', e.target.value);
										}}
									/>
								</FormControl>
								<FormDescription>Description of the content</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="content"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Content</FormLabel>
								<FormControl>
									<QuillEditor
										field={field}
										onContentChange={(value) => {
											handleOnFieldChange('content', value);
										}}
									/>
								</FormControl>
								<FormDescription>Your main content</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="categoryId"
						render={({ field }) => (
							<FormItem className="flex flex-col">
								<FormLabel>Category</FormLabel>
								{categories.isPending ? (
									<div>Loading...</div>
								) : categories.isError ? (
									<div>No category found</div>
								) : (
									<Popover>
										<PopoverTrigger asChild>
											<FormControl>
												<Button
													variant="outline"
													role="combobox"
													className={cn(
														'w-[200px] justify-between',
														!field.value && 'text-muted-foreground'
													)}
												>
													{field.value
														? categories.data.find(
																(category: { label: string; id: string }) =>
																	category.id === field.value
														  )?.label
														: 'Select category'}
													<ChevronsUpDown className="opacity-50" />
												</Button>
											</FormControl>
										</PopoverTrigger>
										<PopoverContent className="w-[200px] p-0">
											<Command>
												<CommandInput
													placeholder="Search category..."
													className="h-9"
												/>
												<CommandList>
													<CommandEmpty>No category found.</CommandEmpty>
													<CommandGroup>
														{categories.data.map(
															(category: {
																id: string;
																label: string;
																value: string;
															}) => (
																<CommandItem
																	value={category.id}
																	key={category.id}
																	onSelect={() => {
																		form.setValue('categoryId', category.id);
																		handleOnFieldChange(
																			'categoryId',
																			category.id
																		);
																	}}
																>
																	{category.label}
																	<Check
																		className={cn(
																			'ml-auto',
																			category.id === field.value
																				? 'opacity-100'
																				: 'opacity-0'
																		)}
																	/>
																</CommandItem>
															)
														)}
													</CommandGroup>
												</CommandList>
											</Command>
										</PopoverContent>
									</Popover>
								)}
								<FormDescription>
									This is the language that will be used in the dashboard.
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="thumbnail"
						render={() => (
							<FormItem>
								<FormLabel>Thumbnail</FormLabel>
								{previewThumbnail ? ( 
									<>
										<Image
											src={previewThumbnail}
											width={200}
											height={200}
											alt="thumbnail"
										/>
										{postData.state === 'hasData' && (
											<p className="text-center text-sm text-slate-400">
												{postData.data.thumbnailFileName}
											</p>
										)}
									</>
								) : (
									<Flex
										align="center"
										justify="center"
										className="w-full h-[200px] border"
									>
										<p>No thumbnail</p>
									</Flex>
								)}
								<FormControl>
									<Input
										type="file"
										accept="image/*"
										onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
											handleThumbnailChange(e);
										}}
									/>
								</FormControl>
								<FormDescription>Thumbnail of the post</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit" loading={mutation.isPending}>
						Save
					</Button>
				</form>
			</Form>
		</div>
	);
};

export default CreateNewPostPage;
