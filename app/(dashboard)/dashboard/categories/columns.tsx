'use client';

import { Toast } from '@/lib/sweetalert';
import { Button } from '@radix-ui/themes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import axios from 'axios';
import Swal from 'sweetalert2';

// Tipe untuk kategori
export type Category = {
	id: string;
	label: string;
	value: string;
};

const DeleteButton = ({ category }: { category: Category }) => {
	const queryClient = useQueryClient();

	const mutation = useMutation<void, Error, string>({
		mutationKey: ['categories'],
		mutationFn: async (id) => {
			const response = await axios.delete(`/api/category/${id}`);
			return response.data.category;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['categories'],
			}); // Refresh data
			Toast.fire({
				title: 'Category deleted successfully',
				icon: 'success',
			});
		},
		onError: (error) => {
			Swal.fire('Error', error.message, 'error');
		},
	});

	const handleClick = () => {
		Swal.fire({
			title: 'Are you sure?',
			text: "You won't be able to revert this!",
			icon: 'warning',
			confirmButtonText: 'Yes, delete it!',
			showCancelButton: true,
		}).then((result) => {
			if (result.isConfirmed) {
				mutation.mutate(category.id);
			}
		});
	};

	return (
		<Button
			onClick={handleClick}
			className="px-2 py-1 text-sm text-white bg-red-500 rounded"
			loading={mutation.isPending}
		>
			Delete
		</Button>
	);
};

const EditButton = ({ category }: { category: Category }) => {
	const queryClient = useQueryClient();

	const mutation = useMutation<void, Error, { id: string; label: string }>({
		mutationKey: ['categories'],
		mutationFn: async ({ id, label }) => {
			const response = await axios.put(`/api/category/${id}`, { label });
			return response.data.category;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['categories'],
			}); // Refresh data
			Toast.fire({
				title: 'Category updated successfully',
				icon: 'success',
			});
		},
		onError: (error) => {
			Swal.fire('Error', error.message, 'error');
		},
	});

	const handleClick = () => {
		Swal.fire({
			title: 'Edit Category',
			input: 'text',
			inputValue: category.label,
			inputAttributes: {
				autocapitalize: 'off',
			},
			showCancelButton: true,
			confirmButtonText: 'Update',
			showLoaderOnConfirm: true,
			preConfirm: async (newLabel) => {
				if (!newLabel) {
					Swal.showValidationMessage('Category label cannot be empty');
					return false;
				}
				return mutation.mutateAsync({ id: category.id, label: newLabel });
			},
			allowOutsideClick: () => !Swal.isLoading(),
		}).then((result) => {
			if (result.isConfirmed) {
				Toast.fire({
					title: 'Category has been updated!',
					icon: 'success',
				});
			}
		});
	};

	return (
		<Button
			onClick={handleClick}
			className="px-2 py-1 text-sm text-white bg-yellow-500 rounded"
			loading={mutation.isPending}
		>
			Edit
		</Button>
	);
};

// Membuat columnHelper
const columnHelper = createColumnHelper<Category>();

// Definisi kolom
export const columns: ColumnDef<Category, string>[] = [
	columnHelper.accessor('label', {
		header: 'Category Name',
		cell: (info) => <span>{info.getValue()}</span>,
		enableSorting: true, // Aktifkan fitur sorting
	}),
	columnHelper.display({
		id: 'actions', // Kolom khusus tanpa accessor
		header: 'Actions',
		cell: ({ row }) => {
			const category = row.original; // Tipe otomatis Category
			return (
				<div className="flex items-center space-x-2">
					<EditButton category={category} />
					<DeleteButton category={category} />
				</div>
			);
		},
	}),
];
