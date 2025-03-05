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
import { Flex } from '@radix-ui/themes';

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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, LoaderCircle, X } from 'lucide-react';
import Image from 'next/image';
import Swal from 'sweetalert2';
import { Toast } from '@/lib/sweetalert';
import { useAtom, useSetAtom } from 'jotai';
import {
	editPostIdAtom,
	loadablePostData,
	loadablePostId,
	postDataAtom,
	postIdAtom,
} from '@/jotai';
import { Post, Tag } from '@/types';
import dynamic from 'next/dynamic';
import { Button } from './ui/button';

const QuillEditor = dynamic(() => import('@/components/QuillEditor'), {
	ssr: false,
	loading: () => <span>Loading...</span>,
});

const FormPost = ({ defaultValues }: { defaultValues?: Post | null }) => {
	const initialEditPost = useRef(false);

	const queryClient = useQueryClient();

	const [editPostId, setEditPostId] = useAtom(editPostIdAtom);
	const [postId] = useAtom(loadablePostId);
	const setPostId = useSetAtom(postIdAtom);
	const [postData] = useAtom(loadablePostData);
	const setPostData = useSetAtom(postDataAtom);

	const [showTagsPopover, setShowTagsPopover] = useState(false);

	const [previewThumbnail, setPreviewThumbnail] = useState('');

	const form = useForm<z.infer<typeof postSchema>>({
		resolver: zodResolver(postSchema),
		defaultValues: {
			title: '',
			description: '',
			content: '',
			tags: [],
		},
	});

	const mutation = useMutation<unknown, Error, { id: string; data: FormData }>({
		mutationFn: async ({ id, data }) =>
			await axios.put(`/api/post/${id}/update`, data).then((res) => res.data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['my-posts'],
			});

			setPostId('');

			setPostData({
				slug: '',
				title: '',
				description: '',
				content: '',
				thumbnail: null,
				thumbnailPreview: '',
				thumbnailFileName: '',
				tags: [],
				userId: '',
			});

			Toast.fire('Post updated successfully', '', 'success');

			setEditPostId('');
		},
		onError: (error) => {
			if (error instanceof AxiosError) {
				console.info(error.response?.data.message);
				Swal.fire('Error', error.response?.data.message, 'error');
			} else {
				Swal.fire('Error', error.message, 'error');
			}
		},
	});

	const tags = useQuery<unknown, Error, Tag[]>({
		queryKey: ['tags'],
		queryFn: async () => {
			const response = await axios.get('/api/tags');
			return response.data.tags;
		},
	});

	const handleAddNewTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
		const target = e.target as HTMLInputElement;
		const label = target.value.trim();
		if (!label) return;

		const newTag: Tag = {
			id: crypto.randomUUID(),
			label,
			value: label.toLowerCase().replace(/\s+/g, '-'),
		};

		const currentTags: Tag[] = form.getValues('tags') || [];

		if (!currentTags.some((tag) => tag.value === newTag.value)) {
			const updatedTags = [...currentTags, newTag];

			form.setValue('tags', updatedTags, { shouldValidate: true });

			setPostData((prev) => ({
				...prev,
				tags: updatedTags,
			}));
		}

		setShowTagsPopover(false);
	};

	const handleRemoveTag = (tag: Tag) => {
		const newTags =
			form.getValues('tags')?.filter((t) => t.id !== tag.id) || [];

		form.setValue('tags', newTags, { shouldValidate: true });

		setPostData((prev) => ({
			...prev,
			tags: newTags,
		}));
	};

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
			if (postData.state === 'hasData' && defaultValues) {
				setPostId(defaultValues.id);
				setPostData((prev) => ({
					...prev,
					thumbnailPreview: defaultValues.thumbnail as string,
					tags: defaultValues.postTag
						? defaultValues.postTag.map(({ tag }) => tag)
						: [],
					content: defaultValues.content,
				}));

				setPreviewThumbnail(
					postData.data.thumbnailPreview || (defaultValues.thumbnail as string)
				);

				form.setValue(
					'title',
					postData.data.title ? postData.data.title : defaultValues.title
				);
				form.setValue(
					'description',
					postData.data.description
						? postData.data.description
						: defaultValues.description
				);
				form.setValue(
					'content',
					postData.data.content
						? postData.data.content
						: defaultValues.content || ''
				);

				form.setValue(
					'tags',
					postData.data.tags
						? postData.data.tags
						: defaultValues.postTag
						? defaultValues.postTag.map(({ tag }) => tag)
						: []
				);

				if (!defaultValues.thumbnail) {
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
				} else {
					form.setValue('thumbnail', null);
				}
			}
		};

		if (postId.state === 'hasData' && !initialEditPost.current) {
			restoreFileOnce();

			if (postData.state === 'hasData') {
				if (postData.data.content && defaultValues?.content) {
					initialEditPost.current = true;
				}
			}
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/exhaustive-deps
	}, [postData, defaultValues]);

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

				setPreviewThumbnail(base64string);
			};

			reader.readAsDataURL(file);
		}
	};

	const onSubmit = (data: z.infer<typeof postSchema>) => {
		if (postData.state === 'hasData') {
			if (!postData.data.thumbnail && !defaultValues?.thumbnail) {
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
			} else {
				formData.append('thumbnail', defaultValues?.thumbnail as string);
			}
		}

		const tags = form.getValues('tags'); // Ambil tags dari form
		formData.append('tags', JSON.stringify(tags)); // Ubah ke JSON Stringify sebelum dikirim
		// console.info('tags JSON.stringify', JSON.stringify(tags));
		// console.info('tags', tags);
		if (postId.state === 'hasData') {
			mutation.mutate({
				id: postId.data,
				data: formData,
			});
		}
	};

	return (
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
									postId={editPostId || defaultValues?.id}
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
					name="tags"
					render={({ field }) => (
						<FormItem className="flex flex-col gap-2">
							<FormLabel>Tags</FormLabel>
							{tags.isPending ? (
								<div>Loading...</div>
							) : tags.isError ? (
								<div>No tags found</div>
							) : (
								<>
									{field.value && field.value.length > 0 && (
										<div className="flex flex-wrap gap-2">
											{field.value.map((tag) => (
												<div
													key={tag.id}
													className="select-none flex items-center gap-2 text-sm lowercase bg-white border border-slate-300 text-slate-900 w-max pl-3 pr-1 py-[2px] rounded-full"
												>
													<span>{tag.label}</span>
													<Button
														variant="ghost"
														onClick={() => handleRemoveTag(tag)}
														className="flex items-center justify-center text-destructive hover:bg-destructive hover:text-white rounded-full p-1 h-max"
													>
														<X size={20} />
													</Button>
												</div>
											))}
										</div>
									)}
									{field.value.length < 5 && (
										<Popover
											open={showTagsPopover}
											onOpenChange={setShowTagsPopover}
										>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant="outline"
														role="combobox"
														className={cn(
															'w-[300px] justify-between',
															!field.value?.length && 'text-muted-foreground'
														)}
													>
														Select or add tag
														<ChevronsUpDown className="opacity-50" />
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent className="w-[300px] max-w-[400px] p-0">
												<Command>
													<CommandInput
														placeholder="Search or add a tag..."
														className="h-9"
														onKeyDown={(e) => {
															if (e.key === 'Enter') {
																e.preventDefault();
																if (e.currentTarget.value.trim() !== '') {
																	handleAddNewTag(e);
																}
															}
														}}
													/>
													<CommandList>
														<CommandEmpty>
															No tags found. Press Enter to add.
														</CommandEmpty>
														<CommandGroup>
															{tags.data.map((tag: Tag) => (
																<CommandItem
																	value={tag.value}
																	key={tag.id}
																	onSelect={() => {
																		const isSelected = field.value.some(
																			(t: Tag) => t.id === tag.id
																		);

																		const newTags = isSelected
																			? field.value.filter(
																					(t: Tag) => t.id !== tag.id
																			  )
																			: [...field.value, tag];

																		setPostData((prev) => ({
																			...prev,
																			tags: newTags,
																		}));

																		field.onChange(newTags);
																	}}
																>
																	{tag.label}
																	<Check
																		className={cn(
																			'ml-auto',
																			field.value.some(
																				(t: Tag) => t.id === tag.id
																			)
																				? 'opacity-100'
																				: 'opacity-0'
																		)}
																	/>
																</CommandItem>
															))}
														</CommandGroup>
													</CommandList>
												</Command>
											</PopoverContent>
										</Popover>
									)}
								</>
							)}
							<FormDescription>
								{field.value && field.value.length < 5
									? 'Select or add tags (max 5).'
									: "You've reached the limit. Remove a tag to add another."}
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
										src={previewThumbnail as string}
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

				<div className="flex items-center gap-4">
					<Button type="submit" disabled={mutation.isPending}>
						{mutation.isPending ? (
							<div className="flex items-center gap-2">
								<LoaderCircle size={20} className="animate-spin" />
								Loading...
							</div>
						) : (
							<span>{defaultValues ? 'Update' : 'Create'}</span>
						)}
					</Button>
				</div>
			</form>
		</Form>
	);
};

export default FormPost;
