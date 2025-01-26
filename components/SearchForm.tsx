import React from 'react';
import Form from 'next/form';
import { Input } from '@/components/ui/input';
import SearchFormReset from '@/components/SearchFormReset';
import { Button } from '@radix-ui/themes';
import { SearchIcon } from 'lucide-react';

const SearchForm = ({
	query,
	className,
}: {
	query?: string;
	className?: string;
}) => {
	return (
		<Form
			action="/"
			scroll={false}
			className={`search-form h-10 flex gap-x-2 max-w-[600px] ${className}`}
		>
			<Input
				type="search"
				defaultValue={query}
				placeholder="Search posts..."
				className="border border-slate-500 h-full"
				name="query"
			/>
			{query && <SearchFormReset />}
			<Button type="submit" className="p-1 px-2 h-full">
				<SearchIcon className="size-6" />
			</Button>
		</Form>
	);
};

export default SearchForm;
