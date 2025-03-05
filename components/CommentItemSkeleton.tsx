import React from 'react';
import { Skeleton } from './ui/skeleton';
import { Avatar } from './ui/avatar';

export const CommentItemSkeleton = () => {
	return (
		<div className="border border-tertiary rounded-md p-2 pb-2 bg-primary">
			<div className="flex items-center gap-x-4 ">
				<Avatar>
					<Skeleton className="h-10 w-10 rounded-full bg-primary-foreground" />
				</Avatar>
				<div className="h-10 w-full flex flex-col justify-evenly ">
					<Skeleton className="w-[40%] h-2 bg-primary-foreground" />
					<Skeleton className="w-[60%] h-2 bg-primary-foreground" />
				</div>
			</div>
			<div className="flex items-center justify-between gap-x-4 p-2 mt-2">
				<Skeleton className="w-14 h-2 rounded-full bg-primary-foreground" />
				<Skeleton className="w-14 h-2 rounded-full bg-primary-foreground" />
			</div>
		</div>
	);
};
