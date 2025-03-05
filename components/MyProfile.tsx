'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AspectRatio } from './ui/aspect-ratio';
import { Icon } from '@iconify/react/dist/iconify.js';
import { Button } from './ui/button';
import { LoaderCircle, Trash } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Toast } from '@/lib/sweetalert';
import Swal from 'sweetalert2';
import Image from 'next/image';
import { User } from 'next-auth';

import '@/styles/my-profile.css';
import { ScrollArea } from './ui/scroll-area';
import { useSession } from 'next-auth/react';
import { MyProfileSkeleton } from './MyProfileSkeleton';

export const MyProfile = ({ userId }: { userId: string }) => {
	const { data: session } = useSession();

	const queryClient = useQueryClient();
	const [selectedPlatform, setSelectedPlatform] = useState('');

	const [socialMedia, setSocialMedia] = useState<[string, string][]>([]);

	const getUser = useQuery<unknown, Error, User>({
		queryKey: ['profile'],
		queryFn: async () => {
			const response = await axios.get(`/api/user/${userId}`);
			return response.data.user;
		},
		enabled: !!userId,
	});

	const deleteSocialMedia = useMutation({
		mutationKey: ['social-media'],
		mutationFn: async ({ id, platform }: { id: string; platform: string }) => {
			const response = await axios.patch(`/api/social-media/${id}`, {
				platform,
			});
			return response.data.socialMedia;
		},
		onSuccess: () => {
			setSelectedPlatform('');
			queryClient.invalidateQueries({ queryKey: ['profile'] });
			Toast.fire('The social media link has been deleted.', '', 'success');
		},
		onError: (error) => {
			setSelectedPlatform('');
			Swal.fire('Error', error.message, 'error');
		},
	});

	const handleDeleteSocialMedia = (platform: string) => {
		Swal.fire({
			title: 'Heads up!',
			text: 'Once deleted, the social media link cannot be restored. However, you can add it again later in your profile settings.',
			showConfirmButton: true,
			confirmButtonText: 'Delete',
			showCancelButton: true,
			icon: 'warning',
		}).then((result) => {
			if (result.isConfirmed) {
				setSelectedPlatform(platform);

				deleteSocialMedia.mutate({
					id: getUser.data?.socialMediaId as string,
					platform,
				});
			}
		});
	};

	useEffect(() => {
		if (getUser.data?.socialMedia) {
			const socialMediaDataArray = Object.entries(
				getUser.data?.socialMedia || {}
			).filter(([key, url]) => key !== 'id' && url); // Pastikan id tidak ikut ditampilkan
			setSocialMedia(socialMediaDataArray);
		}
	}, [getUser.data]);

	if (getUser.isPending) {
		return <MyProfileSkeleton />;
	}

	return (
		<div className="my-profile mx-auto rounded-xl overflow-hidden shadow-lg relative z-20">
			{/* Profile Header */}

			<div className="my-profile__image">
				{/* Profile Picture */}
				<div className="flex items-center px-6 sm:p-6 absolute sm:static z-40 -bottom-10 w-full h-full">
					<div className="w-32 h-32 sm:w-full sm:h-full rounded-full sm:rounded-none md:rounded-full overflow-hidden bg-white border-4 border-tertiary-foreground shadow-md">
						{getUser.data?.image ? (
							<Image
								src={getUser.data?.image}
								alt={`${getUser.data?.username}'s profile`}
								className="w-full h-full object-cover"
								width={128}
								height={128}
							/>
						) : (
							<div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="48"
									height="48"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
									<circle cx="12" cy="7" r="4"></circle>
								</svg>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Profile Content */}
			<div className="my-profile__info">
				<h1 className="text-2xl sm:text-3xl font-bold">{getUser.data?.name}</h1>
				<p className="text-sm sm:text-base mb-4">@{getUser.data?.username}</p>

				<ScrollArea>
					<p
						className={`text-sm mb-6 pr-4 ${
							getUser.data?.bio ? '' : 'text-center'
						}`}
					>
						{getUser.data?.bio ? (
							getUser.data?.bio
						) : (
							<span className="italic text-slate-400">
								-- No bio provided --
							</span>
						)}
					</p>
				</ScrollArea>
			</div>

			<div className="my-profile__social-media">
				{socialMedia && socialMedia.length > 0 && (
					<div className="px-6 pb-4">
						<h2 className="font-bold text-center min-[500px]:col-span-2 min-[500px]:text-start my-4">
							My Social Media
						</h2>
						<div className="flex flex-col min-[500px]:grid min-[500px]:grid-cols-2 min-[700px]:grid-cols-3 gap-4">
							{socialMedia?.map(([platform, url]) => (
								<div key={platform} className="relative">
									<Link
										href={url}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-3 text-xs tracking-wide md:text-base font-semibold hover:font-bold rounded-md border border-tertiary-foreground p-2 z-10"
									>
										<div className="w-[20px] h-[20px] flex items-center justify-center">
											<AspectRatio ratio={1}>
												{platform === 'instagram' && (
													<Icon
														icon="skill-icons:instagram"
														width={20}
														height={20}
													/>
												)}
												{platform === 'facebook' && (
													<Icon icon="logos:facebook" width={20} height={20} />
												)}
												{platform === 'youtube' && (
													<Icon
														icon="logos:youtube-icon"
														width={20}
														height={20}
													/>
												)}
												{platform === 'github' && (
													<Icon
														icon="skill-icons:github-dark"
														width={20}
														height={20}
													/>
												)}
												{platform === 'linkedin' && (
													<Icon
														icon="skill-icons:linkedin"
														width={20}
														height={20}
													/>
												)}
												{platform === 'tiktok' && (
													<Icon
														icon="logos:tiktok-icon"
														width={20}
														height={20}
													/>
												)}
												{platform === 'other' && (
													<Icon
														icon="arcticons:emoji-web"
														width={20}
														height={20}
													/>
												)}
											</AspectRatio>
										</div>
										<span>{platform}</span>
									</Link>

									{session?.user.id === userId && (
										<Button
											variant="ghost"
											onClick={() => {
												handleDeleteSocialMedia(platform);
											}}
											className="group flex justify-center items-center rounded-full hover:bg-destructive hover:text-white text-destructive  h-[30px] w-[30px] p-2 absolute right-2 top-1/2 -translate-y-1/2 z-20"
										>
											<Trash
												size={20}
												className="group-hover:stroke-white group-hover:fill-white stroke-primary-foreground fill-destructive m-0 p-0"
											/>
										</Button>
									)}

									<div
										className={`${
											selectedPlatform === platform
												? 'absolute top-0 bottom-0 left-0 right-0 z-30 bg-slate-300'
												: 'hidden'
										} flex items-center justify-center cursor-wait`}
									>
										<div className="flex items-center justify-center gap-2">
											<LoaderCircle
												size={20}
												className="animate-spin text-destructive"
											/>
											<span>Deleting...</span>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
