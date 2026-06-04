import { type NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '~/lib/auth/session';
import { presignR2Put } from '~/lib/english/r2-sign';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireAuth();

    const body = await req.json();
    const { filename, contentType } = body as {
      filename?: string;
      contentType?: string;
    };

    if (!filename || typeof filename !== 'string' || filename.trim() === '') {
      return NextResponse.json(
        { error: 'filename is required' },
        { status: 400 }
      );
    }

    if (
      !contentType ||
      typeof contentType !== 'string' ||
      !contentType.startsWith('audio/')
    ) {
      return NextResponse.json(
        { error: 'contentType must start with audio/' },
        { status: 400 }
      );
    }

    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const r2Key = `audio/user/${user.id}/${Date.now()}-${sanitizedFilename}`;

    const uploadUrl = presignR2Put(r2Key, contentType, 300);

    return NextResponse.json({ uploadUrl, r2Key });
  } catch (error) {
    if (error instanceof Error && error.message.includes('redirect')) {
      throw error;
    }
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}
