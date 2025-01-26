import React from 'react';

import { AddNewCategoryButton } from '@/components/AddNewCategoryButton';
import { Flex, Heading, Section } from '@radix-ui/themes';
import { CategoryList } from '@/components/CategoryList';

const CategoriesPage = async () => {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_BASE_URL}/api/category`
	);

	const data = await response.json();
	const { categories } = data;

	return (
		<div className="w-full">
			<Flex justify="between" align="center" className="w-full">
				<Heading as="h1" className="w-max">
					Categories
				</Heading>
				<AddNewCategoryButton />
			</Flex>
			<Section>
				<CategoryList initialData={categories} />
			</Section>
		</div>
	);
};

export default CategoriesPage;
