import React from 'react';
import Form from 'next/form';
import { Input } from '@/components/ui/input';
import SearchFormReset from '@/components/SearchFormReset';
import { Search } from 'lucide-react';
import { Button } from './ui/button';

const SearchForm = ({
	query,
	className,
}: {
	query?: string;
	className?: string;
}) => {
	return (
		<Form
			action="/posts"
			scroll={false}
			className={`search-form flex items-center gap-x-2 sm:gap-4 ${className}`}
		>
			<Input
				type="text"
				defaultValue={query}
				placeholder="Search posts..."
				className="h-full text-sm sm:text-base "
				name="query"
			/>
			{query && <SearchFormReset />}
			<Button
				type="submit"
				variant="ghost"
				className="px-3 py-1 h-full btn-primary"
			>
				<Search strokeWidth={2} />
			</Button>
		</Form>
	);
};

export default SearchForm;
