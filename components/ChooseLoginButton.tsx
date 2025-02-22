'use client';

import React, { useEffect } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';

import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { signIn } from 'next-auth/react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { ScrollArea } from './ui/scroll-area';
import { useAtom } from 'jotai';
import { hasAccountAtom, showModalAuthAtom } from '@/jotai';
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert, AlertDescription } from './ui/alert';
import { ShieldX } from 'lucide-react';

const ChooseLoginButton = () => {
	const [isErrorDialogOpen, setIsErrorDialogOpen] = React.useState(false);
	const [showModalAuth, setShowModalAuth] = useAtom(showModalAuthAtom);

	const [hasAccount, setHasAccount] = useAtom(hasAccountAtom);

	const searchParams = useSearchParams();

	const [errorMessage, setErrorMessage] = React.useState('');

	const error = searchParams.get('error');
	const code = searchParams.get('code');
	const auth = searchParams.get('auth');

	const router = useRouter();

	useEffect(() => {
		if (auth === 'login') {
			setShowModalAuth(true);
		}

		if (error || code) {
			if (!showModalAuth) {
				setShowModalAuth(true);
			}

			if (code === 'email_registered') {
				setTimeout(() => {
					setErrorMessage(
						'Your email is already registered. Please try logging in by entering your email and password.'
					);
					setIsErrorDialogOpen(true);
				}, 200);
			}

			if (error === 'Configuration') {
				setTimeout(() => {
					setErrorMessage('Something went wrong. Please try again later.');
					setIsErrorDialogOpen(true);
				}, 200);
			}

			// Tunggu sebelum melakukan redirect
			setTimeout(() => {
				router.replace('/');
			}, 2000);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [error, code, auth]);

	return (
		<>
			{/* Error Dialog */}
			<Dialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
				<DialogContent className="bg-slate-900 text-white border border-red-400">
					<DialogHeader>
						<DialogTitle className="text-center hidden">Title</DialogTitle>
						<DialogDescription className="text-center hidden">
							Description
						</DialogDescription>
					</DialogHeader>
					<div className="flex flex-col justify-center items-center gap-4">
						<ShieldX size={80} className="text-destructive" />
						<Alert variant="destructive" className="text-white">
							{/* <AlertCircle className="h-4 w-4" /> */}
							{/* <AlertTitle>Error</AlertTitle> */}
							<AlertDescription>
								{errorMessage || 'An unexpected error occurred'}
							</AlertDescription>
						</Alert>
					</div>
				</DialogContent>
			</Dialog>

			{/* Main dialog */}
			<Dialog open={showModalAuth} onOpenChange={setShowModalAuth}>
				<DialogTrigger asChild>
					<Button
						variant="ghost"
						className="background-highlight hover:bg-slate-900 text-dark hover:text"
					>
						Login
					</Button>
				</DialogTrigger>
				<DialogContent className="sm:max-w-[425px] h-max text-dark">
					<DialogHeader>
						<DialogTitle className="text-center">
							{hasAccount ? 'Login' : 'Register'}
						</DialogTitle>
						<DialogDescription className="text-center hidden">
							{hasAccount
								? 'Log in using one of the following options'
								: 'Register using one of the following options'}
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4">
						{hasAccount ? (
							<LoginForm />
						) : (
							<ScrollArea className="max-h-[200px] xxs:max-h-[300px] xs:max-h-[400px] sm:max-h-[500px] md:max-h-[350px] pr-4">
								<RegisterForm />
							</ScrollArea>
						)}
						<fieldset className="border">
							<legend className="text-sm mx-auto text-center font-semibold leading-6 text-gray-900">
								Or continue with
							</legend>

							<div className="flex justify-center items-center gap-2 my-4">
								<Button
									variant="outline"
									onClick={async () => {
										await signIn('google');
									}}
								>
									<FcGoogle />
									<span>Google</span>
								</Button>
								<Button
									variant="outline"
									onClick={async () => {
										await signIn('github');
									}}
								>
									<FaGithub />
									<span>Github</span>
								</Button>
							</div>
						</fieldset>
						<div className="text-center text-sm">
							{!hasAccount ? (
								<p>
									Already have an account?{' '}
									<span
										className="underline cursor-pointer"
										onClick={() => setHasAccount(!hasAccount)}
									>
										Login
									</span>
								</p>
							) : (
								<p>
									Dont have an account?{' '}
									<span
										className="underline cursor-pointer"
										onClick={() => setHasAccount(!hasAccount)}
									>
										Register
									</span>
								</p>
							)}
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default ChooseLoginButton;
