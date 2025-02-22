'use client';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { ArrowDownUp } from 'lucide-react';

export const SortDropdownPosts = ({
	sortBy,
	className,
}: {
	sortBy: string;
	className?: string;
}) => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	// Opsi sorting
	const sortingOptions = [
		{ value: 'latest', label: 'Terbaru' },
		{ value: 'popular', label: 'Terpopuler' },
		{ value: 'most_commented', label: 'Paling Banyak Dikomentari' },
	];

	// Fungsi untuk mengganti sorting di URL
	const handleSortChange = (sort: string) => {
		const params = new URLSearchParams(searchParams);
		params.set('sort', sort);
		router.push(`${pathname}?${params.toString()}`);
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className={className}>
					<ArrowDownUp />
					{sortingOptions.find((s) => s.value === sortBy)?.label || 'Urutkan'}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start">
				{sortingOptions.map((option) => (
					<DropdownMenuItem
						key={option.value}
						onClick={() => handleSortChange(option.value)}
					>
						{option.label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
