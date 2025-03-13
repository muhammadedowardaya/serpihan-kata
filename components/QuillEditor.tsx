'use client';

import React, { useEffect, useRef } from 'react';

import Quill from 'quill';
import hljs from 'highlight.js';

import { useAtom } from 'jotai';
import {
	editPostIdAtom,
	loadablePostData,
	loadablePostId,
	progressAtom,
} from '@/jotai';
import axios, { AxiosProgressEvent } from 'axios';
import Swal from 'sweetalert2';

import '@/styles/quill-editor.scss';

import { CustomTabBlot } from '@/lib/CustomTab.js';
import { addUndoRedoHandlers } from '@/lib/undoRedo';

const applyCustomIndent = (editor: Quill, type: 'increase' | 'decrease') => {
	const range = editor.getSelection();
	if (!range) return;

	if (type === 'increase') {
		// Tambahkan custom tab di posisi kursor
		editor.insertEmbed(range.index, 'custom-tab', true);
	} else {
		// Hapus custom tab jika ada
		const [blot, offset] = editor.getLeaf(range.index);
		if (blot instanceof CustomTabBlot) {
			editor.deleteText(range.index - offset, 1);
		}
	}

	editor.setSelection(range.index + 1); // Geser kursor ke depan
};

const QuillEditor = ({
	field,
	postId,
	onContentChange,
}: {
	postId?: string;
	field: { value: string; onChange: (value: string) => void };
	onContentChange?: (value: string) => void;
}) => {
	const [editPostId] = useAtom(editPostIdAtom);
	const [asyncPostId] = useAtom(loadablePostId);
	const [postData] = useAtom(loadablePostData);
	const [, setProgress] = useAtom(progressAtom);

	const undoRef = useRef<HTMLButtonElement | null>(null);
	const redoRef = useRef<HTMLButtonElement | null>(null);

	const editorRef = useRef<Quill | null>(null);
	const editorContainer = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (postData.state === 'hasData') {
			console.info('postData hasData');
			if (editorRef?.current) {
				console.info('editorRef.current ada');

				editorRef.current.root.innerHTML = field.value || '';
			}
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [editorRef.current, postId, editPostId, postData.state]);

	const handleImageUpload = async (quill: Quill, postId: string) => {
		editorRef?.current?.enable(false);
		const range = quill.getSelection();

		const input = document.createElement('input');
		input.setAttribute('type', 'file');
		input.setAttribute('accept', 'image/*');

		input.onchange = async () => {
			const file = input.files?.[0];

			if (asyncPostId.state === 'loading') {
				Swal.fire({
					showConfirmButton: false,
					title: 'Loading...',
					text: 'Please wait while we load the editor.',
					timerProgressBar: true,
					allowEscapeKey: false,
					allowOutsideClick: false,
					didOpen: () => Swal.showLoading(),
				});
			} else if (asyncPostId.state === 'hasData') {
				Swal.hideLoading();
				Swal.close();

				if (file) {
					if (file.size > 2 * 1024 * 1024) {
						Swal.fire('Error', 'File size exceeds the limit (2MB).', 'error');
						return;
					}

					if (!file.type.startsWith('image/')) {
						Swal.fire('Error', 'Only image files are allowed.', 'error');
						return;
					}

					const formData = new FormData();
					formData.append('file', file);
					formData.append('postId', postId);

					try {
						const response = await axios.post('/api/upload', formData, {
							headers: { 'Content-Type': 'multipart/form-data' },
							onUploadProgress: (progressEvent: AxiosProgressEvent) => {
								const percentComplete = Math.round(
									(progressEvent.loaded / (progressEvent.total ?? 1)) * 100
								);
								setProgress(percentComplete);
							},
						});

						if (response.status === 200) {
							const data = response.data;

							if (range) {
								quill.insertText(range.index + 1, '\n');
								quill.insertEmbed(range.index, 'image', data.url);
								quill.setSelection(range.index + 2);
							} else {
								console.info('range tidak ada');
							}
						} else {
							console.info(response.data);
							Swal.fire('Error', 'Failed to upload image.', 'error');
						}
					} catch (error) {
						if (axios.isAxiosError(error)) {
							console.info(
								`error quill editor `,
								error.response?.data.message || 'Unknown error'
							);
							Swal.fire('Error', error.response?.data.message, 'error');
						} else if (error instanceof Error) {
							console.error(error.message);
							Swal.fire('Error', error.message, 'error');
						}
					} finally {
						editorRef.current?.enable(true);
						setProgress(0);
					}
				} else {
					if (range) {
						quill.setSelection(range.index);
					}
				}
			}
		};

		editorRef?.current?.enable(true);
		input.click();
	};

	useEffect(() => {
		if (!editorContainer.current || editorRef.current) return;

		const initializeEditor = async () => {
			if (asyncPostId.state === 'loading') {
				console.info('asyncPostId loading...');

				await Swal.fire({
					showConfirmButton: false,
					title: 'Loading...',
					text: 'Please wait while we load the editor.',
					timerProgressBar: true,
					allowEscapeKey: false,
					allowOutsideClick: false,
					didOpen: () => Swal.showLoading(),
				});
			} else if (asyncPostId.state === 'hasData') {
				console.info('asyncPostId sudah siap');
				Swal.hideLoading();
				Swal.close();

				if (editorContainer.current) {
					const bindings = {
						tab: {
							key: 9, // KeyCode untuk Tab
							handler: function (range: { index: number; length: number }) {
								if (!range) return;
								editor.insertEmbed(range.index, 'custom-tab', true);
								editor.setSelection(range.index + 1);
							},
							priority: 1,
						},
					};

					const currentPostId =
						postId !== undefined ? (postId as string) : asyncPostId.data;

					const editor = new Quill(editorContainer.current, {
						theme: 'snow',
						modules: {
							syntax: { hljs },
							toolbar: {
								container: [
									[{ size: ['small', false, 'large', 'huge'] }],
									[{ header: [1, 2, 3, 4, 5, 6, false] }],
									['bold', 'italic', 'underline', 'strike'],
									['blockquote', 'code-block'],
									['link', 'image', 'video', 'formula'],
									[{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
									[{ script: 'sub' }, { script: 'super' }],
									[{ indent: '-1' }, { indent: '+1' }],
									[{ direction: 'rtl' }],
									[{ color: [] }, { background: [] }],
									[{ font: [] }],
									[{ align: [] }],
									['clean'],
								],
								handlers: {
									image: () => handleImageUpload(editor, currentPostId),
									undo: () => editor.history.undo(),
									redo: () => editor.history.redo(),
									indent: (value: string) =>
										applyCustomIndent(
											editor,
											value === '+1' ? 'increase' : 'decrease'
										),
								},
							},
							keyboard: {
								bindings: bindings,
							},
							history: {
								delay: 2000,
								maxStack: 500,
								userOnly: true,
							},
						},
					});

					addUndoRedoHandlers(editor);

					editor.on('text-change', () => {
						if (onContentChange) onContentChange(editor.root.innerHTML);
						field.onChange(editor.root.innerHTML);
					});

					editorRef.current = editor;
				}
			}
		};

		initializeEditor();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [asyncPostId, postId, editPostId, postData.state]);

	return (
		<div
			ref={editorContainer}
			aria-disabled
			className="h-[300px]! w-full border p-4"
		></div>
	);
};

export default QuillEditor;
