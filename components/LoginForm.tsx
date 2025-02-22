'use client';

import { loginSchema } from '@/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
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
import { signIn } from 'next-auth/react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertCircle, LoaderCircle } from 'lucide-react';
import { useAtom } from 'jotai';
import { showModalAuthAtom } from '@/jotai';
import { Toast } from '@/lib/sweetalert';

export const LoginForm = () => {
	const [, setShowModalAuth] = useAtom(showModalAuthAtom);

	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm<z.infer<typeof loginSchema>>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	});

	const onSubmit = async (values: z.infer<typeof loginSchema>) => {
		setError('');
		setIsLoading(true);

		const result = await signIn('credentials', {
			email: values.email,
			password: values.password,
			redirect: false,
		});

		if (result?.error) {
			setError((result.code as string) || result.error);
			setIsLoading(false);
		} else {
			setShowModalAuth(false);
			setIsLoading(false);
			// router.push('/');
			// queryClient.invalidateQueries({
			// 	queryKey: ['user'],
			// });
			Toast.fire('Login successful', '', 'success');
			window.location.reload();
		}
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="w-full max-w-[500px] space-y-4"
			>
				{error && (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>Error</AlertTitle>
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input placeholder="type here..." {...field} />
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
								<Input placeholder="type here..." type="password" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit" className="w-full" disabled={isLoading}>
					{isLoading ? (
						<div className="flex items-center gap-2">
							<LoaderCircle size={20} className="animate-spin" />
							<span>Loading...</span>
						</div>
					) : (
						'Submit'
					)}
				</Button>
			</form>
		</Form>
	);
};
