'use client';

import * as React from 'react';
import { Check, Filter } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { useAtom } from 'jotai';
import { filterByTagsAtom } from '@/jotai';
import { Tag } from '@/types';

export const FilterByTags = ({
	tags,
	className,
}: {
	tags: Tag[];
	className?: string;
}) => {
	const [open, setOpen] = React.useState(false);
	const [filterByTags, setFilterByTags] = useAtom(filterByTagsAtom);

	// Toggle tag selection
	const toggleTagSelection = (tag: Tag) => {
		setFilterByTags(
			(prev) =>
				prev.some((t) => t.id === tag.id)
					? prev.filter((t) => t.id !== tag.id) // Hapus jika sudah ada
					: [...prev, tag] // Tambah jika belum ada
		);
	};

	// Format label untuk tombol
	// const selectedTagsLabel =
	// 	filterByTags.length > 0
	// 		? filterByTags.map((t) => t.label).join(', ')
	// 		: 'Select Tag...';

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button className={`${className}`} variant="ghost">
					<Filter
						className={`h-full${filterByTags.length > 0 ? 'fill-black' : ''}`}
					/>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[250px] p-0">
				<Command>
					<CommandInput placeholder="Search tag..." />
					<CommandList>
						<CommandEmpty>No Tags found.</CommandEmpty>
						<CommandGroup>
							{tags.map((tag) => {
								const isSelected = filterByTags.some((t) => t.id === tag.id);
								return (
									<CommandItem
										key={tag.id}
										value={tag.value}
										onSelect={() => toggleTagSelection(tag)}
									>
										<Check
											className={cn(
												'mr-2 h-4 w-4',
												isSelected ? 'opacity-100' : 'opacity-0'
											)}
										/>
										{tag.label}
									</CommandItem>
								);
							})}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
};
