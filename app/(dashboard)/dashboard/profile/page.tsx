'use client';

import { User } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import React, { useEffect } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/effect-cards';

import { EffectCards } from 'swiper/modules';
import { LoaderCircle, Pencil, Quote, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import EditFromProfile from '@/components/EditFormProfile';
import { editProfileAtom } from '@/jotai';
import { useAtom } from 'jotai';

const ProfilePage = () => {
	const { data: session } = useSession();

	const [editProfile, setEditProfile] = useAtom(editProfileAtom);

	const queryClient = useQueryClient();

	const getUser = useQuery<unknown, Error, User>({
		queryKey: ['profile', session?.user?.id],
		queryFn: async () => {
			const response = await axios.get(`/api/user`);
			return response.data.user;
		},
		enabled: !!session?.user?.id,
	});

	useEffect(() => {
		queryClient.invalidateQueries({ queryKey: ['profile', session?.user?.id] });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [editProfile]);

	return (
		<div className="flex flex-col justify-center items-center relative">
			<h1 className="text-2xl font-[700] mb-6">
				{editProfile ? 'Edit Profile' : 'Profile'}
			</h1>
			{!editProfile ? (
				<Swiper
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
								<h2 className="absolute uppercase text-lg lg:text-2xl text-center left-1/2 -translate-x-1/2 top-0 text-white w-full z-20 p-4 lg:px-4 lg:pt-8">
									{getUser.data?.name}
								</h2>
								<h3 className="absolute left-1/2 -translate-x-1/2 bottom-[20px] text-white z-20 bg-black/80 rounded-lg">
									@{getUser.data?.username}
								</h3>
								<div
									className={`absolute w-full h-full ${
										getUser.data?.image
											? 'bg-gradient-to-b from-black/60 via-transparent to-black/30'
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
										<Quote size={20} className="absolute -left-6 -top-4" />
										{getUser.data?.bio}
									</p>
								) : (
									<p className="lg:text-center lg:text-xl italic text-slate-300 mt-4">-- no bio --</p>
								)}
							</SwiperSlide>
							<SwiperSlide className="bg-white p-6 lg:p-10 shadow-md border">
								<h1 className="lg:text-center lg:text-xl">
									Follow My Social Media
								</h1>
							</SwiperSlide>
						</>
					)}
				</Swiper>
			) : (
				<EditFromProfile />
			)}

			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						{editProfile ? (
							<Button
								variant="ghost"
								className="absolute top-0 right-0 rounded-full w-[50px] h-[50px]"
								onClick={() => setEditProfile(false)}
							>
								<X size={20} />
							</Button>
						) : (
							<Button
								variant="ghost"
								className="absolute top-0 right-0 rounded-full w-[50px] h-[50px]"
								onClick={() => setEditProfile(true)}
							>
								<Pencil size={20} />
							</Button>
						)}
					</TooltipTrigger>
					<TooltipContent>
						{editProfile ? 'Cancel Edit' : 'Edit Profile'}
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		</div>
	);
};

export default ProfilePage;
