'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';

import 'swiper/css';
import 'swiper/css/effect-cards';

import { Pencil, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { editProfileAtom } from '@/jotai';
import { useAtom } from 'jotai';
import { MyAlert } from '@/components/MyAlert';
import { User } from 'next-auth';
import EditFormProfile from '@/components/EditFormProfile';
import dynamic from 'next/dynamic';
import { MyProfileSkeleton } from '@/components/MyProfileSkeleton';

const MyProfile = dynamic(
	() => import('@/components/MyProfile').then((mod) => mod.MyProfile),
	{
		ssr: false,
		loading: () => <MyProfileSkeleton />,
	}
);

const ProfilePage = () => {
	const { data: session } = useSession();

	const [editProfile, setEditProfile] = useAtom(editProfileAtom);

	const [showAlertWarning, setShowAlertwarning] = useState(false);

	const queryClient = useQueryClient();

	const getUser = useQuery<unknown, Error, User>({
		queryKey: ['profile'],
		queryFn: async () => {
			const response = await axios.get(`/api/user`);
			return response.data.user;
		},
		enabled: !!session?.user?.id,
	});

	useEffect(() => {
		if (getUser.data) {
			if (!getUser.data?.username) {
				setShowAlertwarning(true);
			}
		}
	}, [getUser.data]);

	useEffect(() => {
		queryClient.invalidateQueries({ queryKey: ['profile'] });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [editProfile]);

	return (
		<div className="flex flex-col justify-center items-center relative pb-16">
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						{editProfile ? (
							<Button
								variant="destructive"
								className="md:sticky top-2 md:top-4 -right-4 rounded-full z-40 ml-auto w-[40px] h-[40px]"
								onClick={() => setEditProfile(false)}
							>
								<X size={20} className="p-0" />
							</Button>
						) : (
							<Button
								variant="secondary"
								className="md:sticky top-2 md:top-4 -right-4 rounded-full z-40 ml-auto w-[50px] h-[50px]"
								onClick={() => setEditProfile(true)}
							>
								<Pencil size={20} />
							</Button>
						)}
					</TooltipTrigger>
					<TooltipContent side="left">
						{editProfile ? 'Cancel Edit' : 'Edit Profile'}
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>

			<h1 className="text-2xl font-[700] mb-6">
				{editProfile ? 'Edit Profile' : 'Profile'}
			</h1>
			{!editProfile ? (
				<MyProfile userId={session?.user.id as string} />
			) : (
				<EditFormProfile />
			)}

			<MyAlert
				open={showAlertWarning}
				title="Warning"
				description={
					<div>
						Hi <b>{getUser.data?.email}</b>, your username is not set. A
						username is required to continue. Set it now to proceed.
					</div>
				}
				textConfirmButton="Set Username"
				type="warning"
				onConfirm={() => {
					setShowAlertwarning(false);
					setEditProfile(true);
				}}
			/>
		</div>
	);
};

export default ProfilePage;

{
	/* <Swiper
					effect={'cards'}
					grabCursor={true}
					modules={[EffectCards]}
					className="w-[300px] h-[300px] lg:w-[400px] lg:h-[400px] flex justify-center items-center"
				>
					{getUser.isPending && (
						<SwiperSlide>
							<div className="flex items-center justify-center border h-full">
								<div className="flex items-center justify-center gap-2 h-max">
									<LoaderCircle className="animate-spin" />
									<span>Loading...</span>
								</div>
							</div>
						</SwiperSlide>
					)}

					{getUser.data && (
						<>
							<SwiperSlide
								style={{
									backgroundImage: `url(${getUser.data?.image})`,
								}}
								className="bg-cover bg-center relative shadow-md border"
							>
								<h2
									className={`${
										getUser.data?.image ? 'text-white' : 'text-black'
									} absolute uppercase text-lg lg:text-2xl text-center left-1/2 -translate-x-1/2 top-0  w-full z-20 p-4 lg:px-4 lg:pt-8`}
								>
									{getUser.data?.name}
								</h2>
								<p
									className={`${
										getUser.data?.image && 'hidden'
									} absolute left-1/2 -translate-x-1/2 bottom-1/2 -translate-y-1/2 text-lg text-center text-slate-400 italic z-20`}
								>{`-- no image --`}</p>
								<h3 className="px-2 pb-[2px] absolute left-1/2 -translate-x-1/2 bottom-[20px] text-white z-20 bg-black/80 rounded-xl">
									@{getUser.data?.username}
								</h3>
								<div
									className={`absolute w-full h-full ${
										getUser.data?.image
											? 'bg-linear-to-b from-black/60 via-transparent to-black/30'
											: 'bg-white'
									}  z-10`}
								></div>
							</SwiperSlide>
							<SwiperSlide className="bg-white p-6 lg:p-10 shadow-md border">
								<h1 className="lg:text-center lg:text-xl">
									Bio <span className="lg:hidden">:</span>
								</h1>
								{getUser.data?.bio ? (
									<p className="text-sm lg:text-base mt-2 lg:mt-6 relative">
										<Quote
											size={20}
											className="hidden lg:block absolute -left-6 -top-4"
										/>
										{getUser.data?.bio}
									</p>
								) : (
									<p className="lg:text-center lg:text-xl italic text-slate-400 mt-4">
										-- no bio --
									</p>
								)}
							</SwiperSlide>
							<SwiperSlide className="bg-white p-6  shadow-md border">
								<h1 className="lg:text-center lg:text-xl mb-6">
									My Social Media
								</h1>
								<ScrollArea className="h-[280px] pl-1 pr-6">
									{socialMedia && socialMedia.length > 0 ? (
										<div className="flex flex-col gap-4">
											{socialMedia?.map(([platform, url]) => (
												<div key={platform} className="relative">
													<Link
														href={url}
														target="_blank"
														rel="noopener noreferrer"
														className="flex items-center gap-3 text-lg hover:font-bold rounded-md border border-slate-600 p-2 z-10"
													>
														<div className="w-[40px] h-[40px]">
															<AspectRatio ratio={1}>
																{platform === 'instagram' && (
																	<Icon
																		icon="skill-icons:instagram"
																		width={40}
																		height={40}
																	/>
																)}
																{platform === 'facebook' && (
																	<Icon
																		icon="logos:facebook"
																		width={40}
																		height={40}
																	/>
																)}
																{platform === 'youtube' && (
																	<Icon
																		icon="logos:youtube-icon"
																		width={40}
																		height={40}
																	/>
																)}
																{platform === 'github' && (
																	<Icon
																		icon="skill-icons:github-dark"
																		width={40}
																		height={40}
																	/>
																)}
																{platform === 'linkedin' && (
																	<Icon
																		icon="skill-icons:linkedin"
																		width={40}
																		height={40}
																	/>
																)}
																{platform === 'tiktok' && (
																	<Icon
																		icon="logos:tiktok-icon"
																		width={40}
																		height={40}
																	/>
																)}
																{platform === 'other' && (
																	<Icon
																		icon="arcticons:emoji-web"
																		width={40}
																		height={40}
																	/>
																)}
															</AspectRatio>
														</div>
														<span>{platform}</span>
													</Link>

													<Button
														variant="ghost"
														onClick={() => {
															handleDeleteSocialMedia(platform);
														}}
														className="flex justify-center items-center rounded-full text-destructive hover:text-white hover:bg-destructive h-[40px] w-[40px] p-2 absolute right-2 top-1/2 -translate-y-1/2 z-20"
													>
														<Trash size={20} />
													</Button>

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
									) : (
										<div className="text-center italic text-slate-400">
											No Social Media
										</div>
									)}
								</ScrollArea>
							</SwiperSlide>
						</>
					)}
				</Swiper> */
}
