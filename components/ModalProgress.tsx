'use client';

import React, { useEffect, useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from './ui/dialog';
import { useAtom } from 'jotai';
import { progressAtom } from '@/jotai';
import { Progress } from './ui/progress';

const ModalProgress = () => {
	const [progress] = useAtom(progressAtom);
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		// Pastikan komponen hanya aktif di klien
		setIsClient(true);
	}, []);

	if (!isClient) return null; // Jangan render apa pun di server

	return (
		<Dialog open={progress > 0}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{`Progress ${progress}%`}</DialogTitle>
					<DialogDescription asChild>
						<Progress value={progress} />
					</DialogDescription>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
};

export default ModalProgress;
