'use client';

import React from 'react';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const Modal = ({ children }: { children: React.ReactNode }) => {
	const router = useRouter();

	return (
		<div className="fixed top-0 left-0 right-0 bottom-0 z-40 flex h-screen w-screen items-center justify-center bg-black bg-opacity-50">
			<div className='w-full max-w-[600px]'>
				{children}
				<X
					className="absolute right-4 top-4 cursor-pointer"
					size={20}
					onClick={() => router.back()}
				/>
			</div>
		</div>
	);
};
