/* eslint-disable @typescript-eslint/no-explicit-any */
import Quill from 'quill';

// Tombol Undo & Redo (ikon Unicode)
const undoButton = document.createElement('button');
undoButton.innerHTML = '↩️'; // Ikon Undo
undoButton.classList.add('ql-undo');

const redoButton = document.createElement('button');
redoButton.innerHTML = '↪️'; // Ikon Redo
redoButton.classList.add('ql-redo');

// Fungsi untuk menangani klik tombol Undo & Redo
export const addUndoRedoHandlers = (editor: Quill) => {
	const toolbar = editor.getModule('toolbar');

	// Pastikan toolbar ada sebelum melanjutkan
	if (!toolbar || !(toolbar as any).container) {
		console.warn('Toolbar tidak ditemukan atau tidak memiliki container.');
		return;
	}

	// Dapatkan container toolbar dengan Type Assertion
	const toolbarContainer = (toolbar as any).container as HTMLElement;

	// Tambahkan tombol Undo & Redo ke dalam toolbar
	toolbarContainer.appendChild(undoButton);
	toolbarContainer.appendChild(redoButton);

	// Tambahkan event listener untuk undo & redo
	undoButton.addEventListener('click', (event: MouseEvent) => {
		event.stopPropagation();
		event.preventDefault();
		editor.history.undo();
	});

	redoButton.addEventListener('click', (event: MouseEvent) => {
		event.stopPropagation();
		event.preventDefault();
		editor.history.redo();
	});
};
