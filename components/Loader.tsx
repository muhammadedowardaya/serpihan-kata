import { Loader2 } from 'lucide-react';
import React from 'react';

export const Loader = ({ text }: { text?: string }) => {
	return (
		<div className="fixed right-0 top-0 left-0 bottom-0 flex flex-col items-center justify-center backdrop-filter backdrop-blur backdrop-opacity-50 bg-white/80 z-40 w-full h-full">
			<div className="flex flex-col items-center justify-center gap-2">
				<Loader2 className="w-12 h-12 animate-spin text-slate-700" />
				<p className="text-lg font-semibold text-slate-700">
					{text ? text : 'Loading...'}
				</p>
			</div>
		</div>
	);
};
