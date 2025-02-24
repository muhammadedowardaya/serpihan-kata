'use client';

import { registerSchema } from '@/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from './ui/form';

import { z } from 'zod';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useAtom } from 'jotai';
import { alertAuthAtom, hasAccountAtom } from '@/jotai';

export const RegisterForm = () => {
	const [, setHasAccount] = useAtom(hasAccountAtom);
	const [, setAlertAuth] = useAtom(alertAuthAtom);

	const mutation = useMutation({
		mutationKey: ['register'],
		mutationFn: ({
			name,
			username,
			email,
			password,
		}: {
			name: string;
			username: string;
			email: string;
			password: string;
		}) => {
			return axios.post('/api/auth/register', {
				name,
				username,
				email,
				password,
			});
		},
		onSuccess: () => {
			setHasAccount(true);
			setAlertAuth({
				title: 'You’re in! 🎉',
				description:
					'Your account has been created. Let’s log in and get started!',
				textConfirmButton: 'Let’s go!',
				type: 'success',
			});
		},
	});

	const form = useForm<z.infer<typeof registerSchema>>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			name: '',
			username: '',
			email: '',
			password: '',
			confirm_password: '',
		},
	});

	const onSubmit = (values: z.infer<typeof registerSchema>) => {
		mutation.mutate({ ...values });
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="w-full max-w-[500px] space-y-4 px-2"
			>
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Name</FormLabel>
							<FormControl>
								<Input
									placeholder="type here..."
									disabled={mutation.isPending}
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="username"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Username</FormLabel>
							<FormControl>
								<Input
									placeholder="type here..."
									disabled={mutation.isPending}
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input
									type="email"
									placeholder="type here..."
									disabled={mutation.isPending}
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Password</FormLabel>
							<FormControl>
								<Input
									placeholder="type here..."
									disabled={mutation.isPending}
									type="password"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="confirm_password"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Confirm Password</FormLabel>
							<FormControl>
								<Input
									placeholder="type here..."
									disabled={mutation.isPending}
									type="password"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit" className="w-full" disabled={mutation.isPending}>
					{mutation.isPending ? 'Loading...' : 'Register'}
				</Button>
			</form>
		</Form>
	);
};
