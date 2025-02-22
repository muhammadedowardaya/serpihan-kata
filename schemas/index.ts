import z from 'zod';

export const loginSchema = z.object({
	email: z.string().min(1, 'email is required').email(),
	password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z
	.object({
		name: z.string().min(1, 'name is required').min(3),
		username: z.string().min(3),
		email: z.string().min(1, 'email is required').email(),
		password: z.string().min(1, 'Password is required'),
		confirm_password: z.string().min(1),
	})
	.refine((data) => data.password === data.confirm_password, {
		message: 'Passwords must match',
		path: ['confirm_password'],
	});

export const userSchema = z.object({
	name: z
		.string()
		.min(3, 'Name must be at least 3 characters.')
		.max(50, 'Name must not exceed 50 characters.')
		.regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces.'),
	username: z
		.string()
		.min(1, 'Username is required')
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
	socialMediaId: z.string().optional(),
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
	tags: z
		.array(
			z.object({
				id: z.string(), // ID harus UUID
				label: z.string(),
				value: z
					.string()
					.min(2, 'Tag must be at least 2 characters.')
					.max(20, 'Tag cannot exceed 20 characters.'),
			})
		)
		.min(1, 'At least one tag is required.')
		.max(5, 'You can select up to 5 tags.'),
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
});

export const categorySchema = z.object({
	category: z.string().min(1, 'Name of category is required').min(3),
});
