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
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Toast } from '@/lib/sweetalert';
import Swal from 'sweetalert2';
import { editProfileAtom } from '@/jotai';
import { useAtom } from 'jotai';

import '@/styles/edit-form-profile.scss';
import { User } from 'next-auth';

const EditFormProfile = () => {
	const { data: session, update } = useSession();

	const [, setEditProfile] = useAtom(editProfileAtom);

	const queryClient = useQueryClient();

	// State untuk pratinjau gambar
	const [previewImage, setPreviewImage] = useState<string | null>(null);
	const [fileImage, setFileImage] = useState<File | null>(null);

	const getUser = useQuery<unknown, Error, User>({
		queryKey: ['profile'],
		queryFn: async () => {
			const response = await axios.get(`/api/user`);
			return response.data.user;
		},
		enabled: !!session?.user?.id,
	});

	const mutation = useMutation<User, Error, { data: FormData }>({
		mutationFn: async ({ data }) => {
			try {
				const response = await axios.patch(`/api/user`, data);
				return response.data.user;
			} catch (error: unknown) {
				// Tangkap error eksplisit dari server
				if (axios.isAxiosError(error)) {
					// Error dari server dengan status selain 2xx
					throw new Error(
						error?.response?.data.error || 'Failed to update profile'
					);
				}
				// Error lain, seperti jaringan
				if (error instanceof Error) {
					throw new Error(error.message || 'Something went wrong');
				}

				throw new Error('Something went wrong');
			}
		},
		mutationKey: ['profile'],
		onSuccess: (data) => {
			update({
				user: {
					username: data?.username,
				},
			});
			queryClient.invalidateQueries({
				queryKey: ['profile'],
			});
			Toast.fire('Profile updated successfully', '', 'success');
			setEditProfile(false);
		},
		onError: (error) => {
			if (axios.isAxiosError(error)) {
				Swal.fire('Error', error.response?.data.error, 'error');
			}

			if (error instanceof Error) {
				Swal.fire('Error', error.message, 'error');
			}
		},
	});

	const form = useForm<z.infer<typeof userSchema>>({
		resolver: zodResolver(userSchema),
		defaultValues: {
			name: '',
			username: '',
			bio: '',
			socialMediaId: '',
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

			if (getUser.data?.socialMedia) {
				form.setValue(
					'socialMedia.facebook',
					(getUser.data?.socialMedia.facebook as string) || ''
				);
				form.setValue(
					'socialMedia.instagram',
					(getUser.data?.socialMedia.instagram as string) || ''
				);
				form.setValue(
					'socialMedia.linkedin',
					(getUser.data?.socialMedia.linkedin as string) || ''
				);
				form.setValue(
					'socialMedia.tiktok',
					(getUser.data?.socialMedia.tiktok as string) || ''
				);
				form.setValue(
					'socialMedia.youtube',
					(getUser.data?.socialMedia.youtube as string) || ''
				);
				form.setValue(
					'socialMedia.github',
					(getUser.data?.socialMedia.github as string) || ''
				);
				form.setValue(
					'socialMedia.other',
					(getUser.data?.socialMedia.other as string) || ''
				);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [getUser.data]);

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
		formData.append('other', values.socialMedia?.other || '');

		if (fileImage) {
			formData.append('image', fileImage);
		} else {
			formData.append('image', (getUser.data?.image as string) || '');
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
				className="edit-form__profile w-full max-w-[400px] md:max-w-[80vw] pb-4 relative"
			>
				<div className="w-full">
					{/* Name Field */}
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem className="profile-input">
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
							<FormItem className="profile-input">
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
							<FormItem className="relative profile-input">
								<FormLabel>Bio</FormLabel>
								<FormControl>
									<Textarea
										className="resize-none h-[180px]"
										placeholder="Type your bio"
										maxLength={150}
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
									{form.getValues('bio')?.length}/150
								</div>
							</FormItem>
						)}
					/>
				</div>
				<div className="w-full">
					<FormItem className="profile-input">
						<FormLabel>Profile Picture</FormLabel>
						<div className="flex justify-center items-center gap-2 pt-1 pb-4">
							{getUser.isPending ? (
								<Skeleton className="w-[100px] h-[100px] rounded-full shrink-0" />
							) : previewImage || getUser.data?.image ? (
								<div className="w-[100px] h-[100px] shrink-0">
									<Image
										src={
											(previewImage as string) ||
											(getUser.data?.image as string)
										}
										alt="Profile Preview"
										width={100}
										height={100}
										className="border border-black w-[100px] h-[100px] shrink-0 rounded-full object-cover"
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
								className="text-sm h-max py-2 block"
							/>
						</FormControl>
						<FormDescription>
							Upload a new profile picture. Supported formats: JPG, PNG.
						</FormDescription>
					</FormItem>

					<fieldset className="social-media">
						<legend className="mx-auto mb-4 text-slate-600">
							Social Media (Optional)
						</legend>

						<div className="social-media__list">
							<FormField
								control={form.control}
								name="socialMedia.instagram"
								render={({ field }) => (
									<FormItem className="social-media__input">
										<FormLabel>Instagram</FormLabel>
										<FormControl>
											<Input {...field} placeholder="Instagram URL" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="socialMedia.tiktok"
								render={({ field }) => (
									<FormItem className="social-media__input">
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
									<FormItem className="social-media__input">
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
									<FormItem className="social-media__input">
										<FormLabel>Github</FormLabel>
										<FormControl>
											<Input {...field} placeholder="Github URL" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="socialMedia.youtube"
								render={({ field }) => (
									<FormItem className="social-media__input">
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
									<FormItem className="social-media__input">
										<FormLabel>Linkedin</FormLabel>
										<FormControl>
											<Input {...field} placeholder="Linkedin URL" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="socialMedia.other"
								render={({ field }) => (
									<FormItem className="social-media__input">
										<FormLabel>Other</FormLabel>
										<FormControl>
											<Input
												{...field}
												placeholder="Other URL like your website"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</fieldset>
				</div>

				<Button
					type="submit"
					disabled={mutation.isPending}
					variant="highlight"
					className="m-[20px_10px_20px_10px] md:mx-auto col-span-2 w-full md:max-w-[400px]
                        md:tracking-wide md:font-bold text-lg md:text-xl md:py-2
                    "
				>
					{mutation.isPending ? 'Updating...' : 'Update Profile'}
				</Button>
			</form>
		</Form>
	);
};

export default EditFormProfile;
