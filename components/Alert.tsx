'use client';

import React from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from './ui/dialog';
import { useAtom } from 'jotai';
import { errorMessageAtom, successMessageAtom } from '@/jotai';

const Alert = () => {
	const [errorMessage] = useAtom(errorMessageAtom);
	const [successMessage] = useAtom(successMessageAtom);

	return (
		<>
			{(errorMessage || successMessage) && (
				<Dialog defaultOpen>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>{errorMessage ? 'Error' : 'Success'}</DialogTitle>
							<DialogDescription>
								{errorMessage ? errorMessage : successMessage}
							</DialogDescription>
						</DialogHeader>
					</DialogContent>
				</Dialog>
			)}
		</>
	);
};

export default Alert;
