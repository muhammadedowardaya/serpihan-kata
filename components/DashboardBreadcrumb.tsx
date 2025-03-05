'use client';

import React from 'react';

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

import { usePathname } from 'next/navigation';

const DashboardBreadcrumb = () => {
	const pathname = usePathname();
	const segments = pathname.split('/').filter((segment) => segment);

	return (
		<div className="">
			<Breadcrumb>
				<BreadcrumbList>
					{segments.map((segment, index) => {
						const isLast = index === segments.length - 1;
						const href = `/${segments.slice(0, index + 1).join('/')}`;

						return (
							<React.Fragment key={href}>
								<BreadcrumbItem>
									{isLast ? (
										<BreadcrumbPage className="font-bold">
											{segment === 'posts'
												? 'View Post'
												: segment === 'saved-posts'
												? 'Saved Posts'
												: segments[1] === 'posts' && segment !== 'edit'
												? 'view post'
												: segment === 'edit'
												? 'edit post'
												: segment}
										</BreadcrumbPage>
									) : (
										<BreadcrumbLink
											className="underline underline-offset-2 text-slate-500 md:text-slate-200 md:hover:text-white"
											href={href}
										>
											{segment}
										</BreadcrumbLink>
									)}
								</BreadcrumbItem>
								{!isLast && <BreadcrumbSeparator />}
							</React.Fragment>
						);
					})}
				</BreadcrumbList>
			</Breadcrumb>
		</div>
	);
};

export default DashboardBreadcrumb;
