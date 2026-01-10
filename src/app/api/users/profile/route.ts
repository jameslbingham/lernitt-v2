// @ts-nocheck
import { NextResponse } from 'next/server';
import { getPublicProfile } from '@/lib/utils/userProfile';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const result = await getPublicProfile(userId);

    if (!result.success) {
      return NextResponse.json({ error: result.reason }, { status: 404 });
    }

    return NextResponse.json(result.profile);

  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
