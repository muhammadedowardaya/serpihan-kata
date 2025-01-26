'use client';

import { Category } from '@/types';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import React from 'react';
import { DataTable } from './ui/data-table';
import { columns } from '@/app/(dashboard)/dashboard/categories/columns';

export const CategoryList = ({ initialData }: { initialData: Category[] }) => {
	const [isClient, setIsClient] = React.useState(false);

	React.useEffect(() => {
		setIsClient(true);
	}, []);

	const { data } = useQuery({
		queryKey: ['categories'],
		queryFn: async () => {
			const response = await axios.get('/api/category');
			return response.data.categories;
		},
		initialData,
	});

	if (!isClient) return;

	return <DataTable columns={columns} data={data} />;
};
