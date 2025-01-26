'use client';

import React, { useEffect } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/monokai.css';

const SyntaxHighlight = ({ children }: { children: React.ReactNode }) => {
	useEffect(() => {
		document
			.querySelectorAll('.ql-code-block-container select')
			.forEach((select) => {
				select.remove(); // Hapus elemen dropdown
			});

		document.querySelectorAll('.ql-code-block').forEach((block) => {
			hljs.highlightElement(block as HTMLElement);
		});
	}, []);

	return <div>{children}</div>;
};

export default SyntaxHighlight;
