import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';

export async function GET(req: NextRequest) {
	const userId = req.nextUrl.searchParams.get('userId');
	if (!userId) {
		return NextResponse.json({ message: 'User ID required' }, { status: 400 });
	}

	const session = await redis.get(`session:${userId}`);
	if (!session) {
		return NextResponse.json({ message: 'Session expired' }, { status: 401 });
	}

	return NextResponse.json(JSON.parse(session));
}
