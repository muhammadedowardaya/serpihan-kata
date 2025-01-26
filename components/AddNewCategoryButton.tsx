'use client';

import React from 'react';

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';

import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from '@/components/ui/drawer';

import { useMediaQuery } from '@/hooks/useMediaQuery';
import { CategoryForm } from './CategoryForm';
import { Button } from './ui/button';
import { CirclePlusIcon } from 'lucide-react';

export const AddNewCategoryButton = () => {
	const [open, setOpen] = React.useState(false);
	const [isClient, setIsClient] = React.useState(false);
	const isDesktop = useMediaQuery('(min-width: 768px)');

	React.useEffect(() => {
		if (typeof window !== 'undefined') {
			setIsClient(true);
		}
	}, []);

	const handleClose = () => setOpen(false);

	if (!isClient) {
		// Render placeholder di server untuk menghindari perbedaan
		return null;
	}

	if (isDesktop) {
		return (
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					<Button>Add New Category</Button>
				</DialogTrigger>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Add New Category</DialogTitle>
					</DialogHeader>
					<CategoryForm onDone={handleClose} />
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Drawer open={open} onOpenChange={setOpen}>
			<DrawerTrigger asChild>
				<CirclePlusIcon />
			</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader className="text-left">
					<DrawerTitle>Add New Category</DrawerTitle>
				</DrawerHeader>
				<CategoryForm onDone={handleClose} />
				<DrawerFooter className="pt-2">
					<DrawerClose asChild>
						<Button variant="secondary">Cancel</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
};
