import z from 'zod';

export const userSchema = z.object({
	name: z
		.string()
		.min(3, 'Name must be at least 3 characters.')
		.max(50, 'Name must not exceed 50 characters.')
		.regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces.'),
	username: z
		.string()
		.min(3, 'Username must be at least 3 characters.')
		.max(30, 'Username must not exceed 30 characters.')
		.regex(
			/^[a-zA-Z0-9_]+$/,
			'Username can only contain letters, numbers, and underscores.'
		),
	bio: z
		.string()
		.max(400, 'Bio must not exceed 50 characters.')
		.or(z.literal(''))
		.optional(),
	socialMedia: z
		.object({
			instagram: z
				.string()
				.url('Invalid Instagram URL')
				.or(z.literal('')) // Mengizinkan string kosong
				.optional(),
			tiktok: z.string().url('Invalid TikTok URL').or(z.literal('')).optional(),
			facebook: z
				.string()
				.url('Invalid Facebook URL')
				.or(z.literal(''))
				.optional(),
			github: z.string().url('Invalid GitHub URL').or(z.literal('')).optional(),
			youtube: z
				.string()
				.url('Invalid YouTube URL')
				.or(z.literal(''))
				.optional(),
			linkedin: z
				.string()
				.url('Invalid LinkedIn URL')
				.or(z.literal(''))
				.optional(),
			other: z.string().optional(), // Tidak perlu validasi URL untuk field ini
		})
		.optional(), // Social media bersifat opsional
});

export const postSchema = z.object({
	title: z.string().min(3, 'Title must be at least 3 characters.'),
	description: z
		.string()
		.min(20, 'Description must be at least 20 characters.')
		.max(100, 'Description cannot exceed 100 characters.'),
	content: z.string().min(20, 'Content must be at least 20 characters.'),
	thumbnail: z
		.instanceof(File)
		.refine(
			(file) => file.size <= 2 * 1024 * 1024, // Validasi ukuran maksimal 2MB
			{ message: 'File size exceeds the limit (2MB).' }
		)
		.refine(
			(file) =>
				[
					'image/png',
					'image/jpeg',
					'image/jpg',
					'image/svg+xml',
					'image/gif',
				].includes(file.type), // Validasi jenis file
			{
				message:
					'Invalid image file type. Accepted types: png, jpeg, jpg, svg, gif.',
			}
		)
		.nullable(),
	categoryId: z.string(),
});

export const categorySchema = z.object({
	category: z.string().min(1, 'Name of category is required').min(3),
});
