'use client';

import React from 'react';
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

const ChooseLoginButton = () => {
	const [open, setOpen] = React.useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline">Login</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Login</DialogTitle>
					<DialogDescription>Log in using one of the following options</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<Button
						variant="outline"
						onClick={() => signIn('google', { redirectTo: '/dashboard' })}
					>
						<FcGoogle />
						<span>Google</span>
					</Button>
					<Button
						variant="outline"
						onClick={() => signIn('github', { redirectTo: '/dashboard' })}
					>
						<FaGithub />
						<span>Github</span>
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default ChooseLoginButton;
