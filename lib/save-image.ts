import { customAlphabet } from 'nanoid';
import slugify from 'slugify';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileTypeFromBuffer } from 'file-type';

const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 8);

export const saveImage = async (file: File, postId: string) => {
	const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', postId);
	console.info('Upload directory:', UPLOAD_DIR);

	try {
		const buffer = Buffer.from(await file.arrayBuffer());
		console.info('File buffer created successfully.');

		const extension = path.extname(file.name).slice(1).toLowerCase();
		console.info('File extension:', extension);

		const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
		if (!allowedExtensions.includes(extension)) {
			console.warn('Invalid file extension:', extension);
			throw new Error('Invalid file type');
		}

		const mime = await fileTypeFromBuffer(buffer);
		console.info('File MIME type:', mime?.mime);

		if (!mime || !mime.mime.startsWith('image/')) {
			console.warn('Invalid MIME type:', mime);
			throw new Error('The uploaded file is not a valid image.');
		}

		const baseName = slugify(
			path.basename(file.name, path.extname(file.name)),
			{
				lower: true,
				replacement: '_',
			}
		);
		const uniqueId = nanoid();
		const fileName = `${baseName}-${uniqueId}.${extension}`;
		const filePath = path.resolve(UPLOAD_DIR, fileName);
		const publicUrl = `/uploads/${postId}/${fileName}`;
		console.info('Generated file name:', fileName);
		console.info('File path:', filePath);
		console.info('Public URL:', publicUrl);

		await fs.mkdir(UPLOAD_DIR, { recursive: true });
		console.info('Upload directory created successfully (if not exists).');

		await fs.writeFile(filePath, buffer);
		console.info('File saved successfully at:', filePath);

		return {
			success: true,
			url: publicUrl,
			uniqueId: uniqueId,
		};
	} catch (error) {
		console.error('Error saving image:', error);
		return {
			success: false,
			error: error,
		};
	}
};
