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

import '@/lib/CustomTab.js';

// interface Format {
// 	bold?: boolean;
// 	italic?: boolean;
// 	underline?: boolean;
// 	strike?: boolean;
// 	code?: boolean;
// 	blockquote?: boolean;
// 	'code-block'?: boolean;
// 	header?: 1 | 2 | 3 | 4 | 5 | 6;
// 	list?: 'ordered' | 'bullet' | 'check';
// 	script?: 'sub' | 'super';
// 	indent?: string;
// 	align?: string;
// 	color?: string;
// 	background?: string;
// 	[key: string]: unknown; // Untuk format tambahan yang mungkin tidak tercantum
// }

// Tipe untuk Context
// interface Context {
// 	format: Format;
// }

// // Tipe untuk Range
// interface Range {
// 	index: number;
// 	length: number;
// }

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

	const editorRef = useRef<Quill | null>(null);
	const editorContainer = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (postData.state === 'hasData') {
			if (editorRef?.current) {
				editorRef.current.root.innerHTML = field.value;
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [editorRef.current, postId, postData.state]);

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
				}
			}
		};

		input.click();
	};

	useEffect(() => {
		if (!editorContainer.current || editorRef.current) return;

		const initializeEditor = async () => {
			if (asyncPostId.state === 'loading') {
				await Swal.fire({
					showConfirmButton: false,
					title: 'Loading...',
					text: 'Please wait while we load the editor.',
					timerProgressBar: true,
					allowEscapeKey: false,
					allowOutsideClick: false,
					didOpen: () => Swal.showLoading(),
				});
			} else if (asyncPostId.state === 'hasData' && asyncPostId.data) {
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
								},
							},
							keyboard: {
								bindings: bindings,
							},
						},
					});

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
	}, [asyncPostId, field.value]);

	return (
		<div
			ref={editorContainer}
			aria-disabled
			className="h-[300px]! w-full border p-4"
		></div>
	);
};

export default QuillEditor;
