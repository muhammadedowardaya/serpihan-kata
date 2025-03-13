import { Skeleton } from './ui/skeleton';

import '@/styles/my-profile.css';

export const MyProfileSkeleton = ({ className }: { className?: string }) => {
	return (
		<div
			className={`my-profile rounded-xl overflow-hidden shadow-lg relative z-20 ${className}`}
		>
			{/* Profile Header */}

			<div className="my-profile__image">
				{/* Profile Picture */}
				<div className="flex items-center px-6 sm:p-6 absolute sm:static z-40 -bottom-10 w-full h-full">
					<Skeleton className="hidden sm:block w-32 h-32 sm:w-full sm:h-full bg-primary-foreground rounded-full sm:rounded-md md:rounded-full overflow-hidden shadow-md" />
					<div className="sm:hidden w-32 h-32 sm:w-full sm:h-full rounded-full sm:rounded-md md:rounded-full overflow-hidden bg-white border-4 sm:border-8 md:border-4 border-tertiary-foreground shadow-md">
						<div className=" w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="48"
								height="48"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
								<circle cx="12" cy="7" r="4"></circle>
							</svg>
						</div>
					</div>
				</div>
			</div>

			{/* Profile Content */}
			<div className="my-profile__info">
				<Skeleton className="w-52 h-4 mb-2 bg-primary-foreground" />
				<Skeleton className="w-32 h-6 mb-4 bg-primary-foreground" />
				<Skeleton className="w-[80%] h-2 bg-primary-foreground mb-2" />
				<Skeleton className="w-[80%] h-2 bg-primary-foreground mb-2" />
				<Skeleton className="w-[90%] h-2 bg-primary-foreground mb-2" />
				<Skeleton className="w-[85%] h-2 bg-primary-foreground mb-2" />
			</div>

			<div className="my-profile__social-media">
				<div className="px-6 pb-4">
					<Skeleton className="w-[50%] h-4 min-[500px]:col-span-2 min-[500px]:text-start my-4 bg-primary-foreground" />
					<div className=" mt-4 flex flex-col min-[500px]:grid min-[500px]:grid-cols-2 min-[700px]:grid-cols-3 gap-2">
						<Skeleton className="w-[200px] h-8 bg-primary-foreground" />
						<Skeleton className="w-[200px] h-8 bg-primary-foreground" />
						<Skeleton className="w-[200px] h-8 bg-primary-foreground" />
						<Skeleton className="w-[200px] h-8 bg-primary-foreground" />
						<Skeleton className="w-[200px] h-8 bg-primary-foreground" />
						<Skeleton className="w-[200px] h-8 bg-primary-foreground" />
						<Skeleton className="w-[200px] h-8 bg-primary-foreground" />
					</div>
				</div>
			</div>
		</div>
	);
};
