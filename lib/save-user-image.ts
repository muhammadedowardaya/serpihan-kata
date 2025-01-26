import path from 'node:path';
import fs from 'node:fs/promises';
import { fileTypeFromBuffer } from 'file-type';

export const saveUserImage = async (file: File, username: string) => {
	const UPLOAD_DIR = path.join(process.cwd(), 'public', 'user-images');

	try {
		const buffer = Buffer.from(await file.arrayBuffer());
		// console.info('File buffer created successfully.');

		const extension = path.extname(file.name).slice(1).toLowerCase();
		// console.info('File extension:', extension);

		const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
		if (!allowedExtensions.includes(extension)) {
			// console.warn('Invalid file extension:', extension);
			throw new Error('Invalid file type');
		}

		const mime = await fileTypeFromBuffer(buffer);
		// console.info('File MIME type:', mime?.mime);

		if (!mime || !mime.mime.startsWith('image/')) {
			// console.warn('Invalid MIME type:', mime);
			throw new Error('The uploaded file is not a valid image.');
		}

		const fileName = `${username}.${extension}`;
		const filePath = path.resolve(UPLOAD_DIR, fileName);
		const publicUrl = `/user-images/${fileName}`;
		// console.info('Generated file name:', fileName);
		// console.info('File path:', filePath);
		// console.info('Public URL:', publicUrl);

		await fs.mkdir(UPLOAD_DIR, { recursive: true });
		// console.info('Upload directory created successfully (if not exists).');

		await fs.writeFile(filePath, buffer);
		// console.info('File saved successfully at:', filePath);

		return {
			success: true,
			url: publicUrl,
		};
	} catch (error) {
		console.error('Error saving image:', error);
		return {
			success: false,
			error: error,
		};
	}
};
