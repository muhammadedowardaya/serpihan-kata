'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';

import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';

import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';

import { z } from 'zod';
import { userSchema } from '@/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { User } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Toast } from '@/lib/sweetalert';
import Swal from 'sweetalert2';
import { editProfileAtom } from '@/jotai';
import { useAtom } from 'jotai';

const EditFromProfile = () => {
	const { data: session } = useSession();

	const [, setEditProfile] = useAtom(editProfileAtom);

	const queryClient = useQueryClient();

	// State untuk pratinjau gambar
	const [previewImage, setPreviewImage] = useState<string | null>(null);
	const [fileImage, setFileImage] = useState<File | null>(null);

	const getUser = useQuery<unknown, Error, User>({
		queryKey: ['profile', session?.user?.id],
		queryFn: async () => {
			const response = await axios.get(`/api/user`);
			return response.data.user;
		},
		enabled: !!session?.user?.id,
	});

	const mutation = useMutation<unknown, Error, { data: FormData }>({
		mutationFn: async ({ data }) => {
			const response = await axios.patch(`/api/user`, data);
			return response.data.user;
		},
		mutationKey: ['profile'],
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['profile', session?.user?.id],
			});
			Toast.fire('Profile updated successfully', '', 'success');
			setEditProfile(false);
		},
		onError: () => {
			Swal.fire('Error', 'Failed to update profile', 'error');
		},
	});

	const form = useForm<z.infer<typeof userSchema>>({
		resolver: zodResolver(userSchema),
		defaultValues: {
			name: '',
			username: '',
			bio: '',
			socialMedia: {
				facebook: '',
				instagram: '',
				linkedin: '',
				tiktok: '',
				youtube: '',
				github: '',
				other: '',
			},
		},
	});

	useEffect(() => {
		if (getUser.data) {
			form.setValue('name', (getUser.data?.name as string) || '');
			form.setValue('username', (getUser.data?.username as string) || '');
			form.setValue('bio', (getUser.data?.bio as string) || '');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [getUser.isLoading]);

	function onSubmit(values: z.infer<typeof userSchema>) {
		const formData = new FormData();
		formData.append('name', values.name);
		formData.append('username', values.username);
		formData.append('bio', values.bio || '');

		formData.append('facebook', values.socialMedia?.facebook || '');
		formData.append('instagram', values.socialMedia?.instagram || '');
		formData.append('linkedin', values.socialMedia?.linkedin || '');
		formData.append('tiktok', values.socialMedia?.tiktok || '');
		formData.append('youtube', values.socialMedia?.youtube || '');
		formData.append('github', values.socialMedia?.github || '');

		if (fileImage) {
			formData.append('image', fileImage);
		}

		mutation.mutate({
			data: formData,
		});
	}

	function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = () => {
				setPreviewImage(reader.result as string);
			};
			reader.readAsDataURL(file);

			setFileImage(file);
		}
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-8 w-full max-w-[400px] pt-6 pb-20"
			>
				{/* Profile Picture Field */}
				<FormItem>
					<FormLabel>Profile Picture</FormLabel>
					<div className="flex justify-center items-center gap-2 pt-1 pb-4">
						{getUser.isPending ? (
							<Skeleton className="w-[100px] h-[100px] rounded-full flex-shrink-0" />
						) : previewImage || getUser.data?.image ? (
							<div className="w-[100px] h-[100px] flex-shrink-0">
								<Image
									src={
										(previewImage as string) || (getUser.data?.image as string)
									}
									alt="Profile Preview"
									width={100}
									height={100}
									className="border border-black w-[100px] h-[100px] flex-shrink-0 rounded-full object-cover"
								/>
							</div>
						) : (
							<div className="w-[100px] h-[100px] overflow-hidden border border-black rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
								<span>No Image</span>
							</div>
						)}
					</div>
					<FormControl>
						<Input
							type="file"
							accept="image/*"
							onChange={handleFileChange}
							className="text-sm h-max"
						/>
					</FormControl>
					<FormDescription>
						Upload a new profile picture. Supported formats: JPG, PNG.
					</FormDescription>
				</FormItem>

				{/* Name Field */}
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Name</FormLabel>
							<FormControl>
								<Input placeholder="Type your name" {...field} />
							</FormControl>
							<FormDescription>
								This is your public display name.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Username Field */}
				<FormField
					control={form.control}
					name="username"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Username</FormLabel>
							<FormControl>
								<Input placeholder="Type your username" {...field} />
							</FormControl>
							<FormDescription>This is your public username.</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Bio Field */}
				<FormField
					control={form.control}
					name="bio"
					render={({ field }) => (
						<FormItem className="relative">
							<FormLabel>Bio</FormLabel>
							<FormControl>
								<Textarea
									className="resize-none h-[180px]"
									placeholder="Type your bio"
									maxLength={400}
									{...field}
								/>
							</FormControl>
							<FormDescription>This is your public bio.</FormDescription>
							<FormMessage />

							<div
								className={`absolute top-0 right-0 ${
									form.getValues('bio')?.length === 0 ? 'hidden' : ''
								}`}
							>
								{form.getValues('bio')?.length}/400
							</div>
						</FormItem>
					)}
				/>

				<fieldset className="space-y-4 px-6 pb-8 border border-slate-300">
					<legend className="mx-auto mb-2 text-slate-600">
						Social Media (Optional)
					</legend>

					{/* Instagram */}
					<FormField
						control={form.control}
						name="socialMedia.instagram"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Instagram</FormLabel>
								<FormControl>
									<Input {...field} placeholder="Instagram URL" />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* TikTok */}
					<FormField
						control={form.control}
						name="socialMedia.tiktok"
						render={({ field }) => (
							<FormItem>
								<FormLabel>TikTok</FormLabel>
								<FormControl>
									<Input {...field} placeholder="TikTok URL" />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="socialMedia.facebook"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Facebook</FormLabel>
								<FormControl>
									<Input {...field} placeholder="Facebook URL" />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="socialMedia.github"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Github</FormLabel>
								<FormControl>
									<Input {...field} placeholder="Github URL" />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* YouTube */}
					<FormField
						control={form.control}
						name="socialMedia.youtube"
						render={({ field }) => (
							<FormItem>
								<FormLabel>YouTube</FormLabel>
								<FormControl>
									<Input {...field} placeholder="YouTube URL" />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="socialMedia.linkedin"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Linkedin</FormLabel>
								<FormControl>
									<Input {...field} placeholder="Linkedin URL" />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</fieldset>

				<Button type="submit" disabled={mutation.isPending} className='bg-green-400'>
					{mutation.isPending ? 'Updating...' : 'Update Profile'}
				</Button>
			</form>
		</Form>
	);
};

export default EditFromProfile;
