import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const POST = async (
    request: NextRequest,
    {
        params,
    }: {
        params: Promise<{ id: string }>;
    }
) => {
    try {
        const id = (await params).id;
        const { userId, message } = await request.json();
        
        const comment = await prisma.comment.create({
            data: {
                userId, // userId akan mengirim sebuah
                message, // komentar
                parentId: id, // ke komentar orang lain (parentId berisi id komentar orang lain)
            },
        });

        return NextResponse.json({
            comment,
            success: true,
            status: 200,
        });
    } catch (error) {
        return NextResponse.json({
            error,
            success: false,
            status: 500,
        });
    }
};
