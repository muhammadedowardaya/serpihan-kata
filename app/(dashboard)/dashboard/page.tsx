'use client';

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toast } from '@/lib/sweetalert';
import { User } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { LoaderCircle, TriangleAlert } from 'lucide-react';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import Swal from 'sweetalert2';

const Dashboard = () => {
	const { data: session } = useSession();

	const [username, setUsername] = React.useState('');

	const router = useRouter();

	const [showAlertWarning, setShowAlertwarning] = useState(false);

	const queryClient = useQueryClient();

	const getUser = useQuery<unknown, Error, User>({
		queryKey: ['user', session?.user?.id],
		queryFn: async () => {
			const response = await axios.get(`/api/user`);
			return response.data.user;
		},
	});

	const mutation = useMutation({
		mutationFn: async ({ data }: { data: FormData }) => {
			const response = await axios.patch(`/api/user`, data);
			return response.data.user;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['user', session?.user?.id],
			});
			Toast.fire('Username set successfully', '', 'success');
			setShowAlertwarning(false);
			router.push('/dashboard/profile');
		},
		onError: (error) => {
			Swal.fire('Error', error.message, 'error');
		},
	});

	const saveUsername = () => {
		if (!username) {
			setShowAlertwarning(true);
			return;
		}

        const formData = new FormData();
        formData.append('username', username);
		mutation.mutate({ data: formData });
	};

	if (getUser.isPending) {
		return (
			<div className="flex items-center gap-x-2">
				<LoaderCircle size={20} className="animate-spin" />
				<span>Loading...</span>
			</div>
		);
	}

	if (showAlertWarning) {
		return (
			<AlertDialog open={showAlertWarning} defaultOpen={false}>
				<AlertDialogTrigger className="hidden">Open</AlertDialogTrigger>
				<AlertDialogContent className="bg-slate-900 border border-yellow-300 ">
					<AlertDialogHeader>
						<AlertDialogTitle asChild>
							<div className="flex flex-col items-center gap-2">
								<TriangleAlert size={40} className="text-yellow-400" />
								<span className="text-slate-100">Username cannot be empty</span>
							</div>
						</AlertDialogTitle>
						<AlertDialogDescription className="text-slate-100">
							Hi <b>{getUser.data?.email}</b>, your username is not set. A
							username is required to continue. Set it now to proceed.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogAction
							className="bg-yellow-400 text-black hover:text-yellow-400 hover:bg-black hover:border hover:border-yellow-300 font-bold"
							onClick={() => setShowAlertwarning(false)}
						>
							OK
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		);
	}

	return (
		<div>
			<h1>Dashboard</h1>

			<AlertDialog open={!getUser.data?.username} defaultOpen={false}>
				<AlertDialogTrigger className="hidden"></AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Your username is not set</AlertDialogTitle>
						<AlertDialogDescription>
							Hi <b className="text-black">{getUser.data?.email}</b>, your
							username is not set. A username is required to continue. Set it
							now to proceed.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<div className="space-y-2">
						<label htmlFor="username">Username</label>
						<Input
							id="username"
							name="username"
							placeholder="Enter your username"
							onChange={(e) => setUsername(e.target.value)}
						/>
					</div>
					<AlertDialogFooter>
						{/* <AlertDialogCancel>Cancel</AlertDialogCancel> */}
						<AlertDialogAction asChild>
							<Button onClick={saveUsername}>
								{mutation.isPending && (
									<LoaderCircle className="animate-spin" />
								)}
								{mutation.isPending ? 'Saving...' : 'Save'}
							</Button>
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};

export default Dashboard;
