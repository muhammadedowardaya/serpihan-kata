import React from 'react';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from './ui/alert-dialog';
import { Info, LoaderCircle, TriangleAlert, X } from 'lucide-react';

import { Icon } from '@iconify/react';
import { Button } from './ui/button';

export const MyAlert = ({
	open,
	title,
	description,
	type,
	textConfirmButton,
	textCancelButton,
	onConfirm,
	onCancel,
	isLoadingConfirm,
}: {
	open: boolean;
	title: string;
	description?: React.ReactNode;
	type: 'error' | 'success' | 'warning' | 'info';
	textConfirmButton?: string;
	textCancelButton?: string;
	onConfirm: () => void;
	onCancel?: () => void;
	isLoadingConfirm?: boolean;
}) => {
	return (
		<AlertDialog open={open}>
			<AlertDialogTrigger asChild disabled className="hidden">
				<Button variant="outline">Show Dialog</Button>
			</AlertDialogTrigger>
			<AlertDialogContent
				className={`bg-slate-900 border ${
					type === 'warning'
						? 'border-yellow-300'
						: type === 'error'
						? 'border-destructive'
						: type === 'info'
						? 'border-blue-500'
						: 'border-emerald-500'
				}`}
			>
				<AlertDialogHeader>
					<AlertDialogTitle asChild>
						<div className="flex flex-col items-center gap-2">
							{type === 'warning' && (
								<TriangleAlert
									size={40}
									className="text-yellow-400"
									role="img"
									aria-label="Warning"
								/>
							)}
							{type === 'error' && (
								<X
									size={40}
									className="text-destructive"
									role="img"
									aria-label="Error"
								/>
							)}
							{type === 'info' && (
								<Info
									size={40}
									className="text-blue-500"
									role="img"
									aria-label="Information"
								/>
							)}
							{type === 'success' && (
								<Icon
									icon="mingcute:check-2-fill"
									width="40"
									height="40"
									className="text-emerald-400"
									role="img"
									aria-label="Success"
								/>
							)}
							<span className="text-slate-100">{title}</span>
						</div>
					</AlertDialogTitle>
					{description && (
						<AlertDialogDescription className="text-slate-100 text-center pb-4">
							{description}
						</AlertDialogDescription>
					)}
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogAction asChild>
						<div className="flex items-center gap-3">
							{textCancelButton && (
								<Button
									variant="secondary"
									onClick={onCancel}
									disabled={isLoadingConfirm}
								>
									{textCancelButton}
								</Button>
							)}
							<Button
								variant="default"
								className={`${
									type === 'success'
										? 'button-success'
										: type === 'error'
										? 'button-error'
										: type === 'info'
										? 'button-info'
										: 'button-warning'
								}`}
								onClick={onConfirm}
								disabled={isLoadingConfirm}
							>
								{isLoadingConfirm ? (
									<div className="flex items-center gap-2">
										<LoaderCircle className="w-6 h-6 animate-spin" />
										<span>Loading...</span>
									</div>
								) : (
									textConfirmButton
								)}
							</Button>
						</div>
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
