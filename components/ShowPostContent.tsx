'use client';

import { Post } from '@/types';
import hljs from 'highlight.js';
import Quill from 'quill';
import { useEffect, useRef } from 'react';

import '@/lib/CustomTab.js';
import '@/styles/show-post-content.scss';

import DOMPurify from 'dompurify';

const ShowPostContent = ({ data }: { data: Post }) => {
	const editorRef = useRef<Quill | null>(null);
	const editorContainer = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (typeof window !== 'undefined' && editorContainer.current) {
			const quill = new Quill(editorContainer.current, {
				theme: 'snow',
				modules: {
					syntax: { hljs },
					toolbar: false,
				},
				readOnly: true,
			});

			editorRef.current = quill;
			quill.root.innerHTML = DOMPurify.sanitize(data.content);

			// Highlight code blocks
			document.querySelectorAll('.ql-code-block').forEach((block) => {
				if (block) {
					const codeElement = block as HTMLElement;
					const codeText = codeElement.textContent || '';
					codeElement.textContent = codeText; // Pastikan hanya teks yang diproses
					hljs.highlightElement(codeElement);
				}
			});

			// Sembunyikan elemen <select> jika masih muncul
			document
				.querySelectorAll('.ql-code-block-container select')
				.forEach((select) => {
					(select as HTMLSelectElement).style.display = 'none';
				});

			document
				.querySelectorAll<HTMLImageElement>('.ql-editor img')
				.forEach((img) => {
					img.addEventListener('click', () => {
						const src = img.getAttribute('src');
						if (src) {
							window.open(src);
						}
					});
				});
		}
	}, [data.content]);

	return <div ref={editorContainer}></div>;
};

export default ShowPostContent;
