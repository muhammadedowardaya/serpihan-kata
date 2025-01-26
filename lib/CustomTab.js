import Quill from 'quill';

const Inline = Quill.import('blots/inline');

class CustomTabBlot extends Inline {

	static blotName = 'custom-tab';
	static tagName = 'span';

	static create() {
		const node = super.create();
		node.classList.add('custom-tab');
		node.textContent = '\u00A0'; // 4 non-breaking spaces

		return node;
	}

	static formats(node) {
		return node.getAttribute('data-value') || true; // Jika ada data tambahan
	}
}

Quill.register(CustomTabBlot);
