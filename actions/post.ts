import { prisma } from "@/lib/prisma";
import { postSchema } from "@/schemas"
import { Post } from "@/types";
import { z } from "zod"

export const createPost = async (data:z.infer<typeof postSchema>) => {
    try {
        const response = await fetch('/api/post', {
            method:'POST',
            headers: {
                'content-type':'application/json'
            },
            body:JSON.stringify(data)
        })

        return response;
    } catch (error) {
        if(error instanceof Error){
            return {
                error: error.message
            }
        }
    }
}

export const updatePost = async (postId: string, updatedData: Post) => {
    // Dapatkan gambar lama yang terkait dengan postingan
    const oldImages = await prisma.image.findMany({
        where: { postId },
    });

    // Dapatkan URL gambar baru dari updatedData
    const newImages = updatedData.images;

    // Cari gambar yang tidak lagi digunakan
    const unusedImages = oldImages.filter(
        (oldImage) => !newImages.includes(oldImage.url)
    );

    // Hapus gambar yang tidak lagi digunakan
    for (const image of unusedImages) {
        const filePath = path.join(process.cwd(), 'public', image.url);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        await prisma.image.delete({ where: { id: image.id } });
    }

    // Simpan data baru ke database
    await prisma.post.update({
        where: { id: postId },
        data: {
            ...updatedData,
        },
    });
}
