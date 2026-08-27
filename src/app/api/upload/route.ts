import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { auth } from '@/auth';

/**
 * Image upload endpoint used by the Tiptap editor and cover/project image
 * pickers. This is one of the few places a Route Handler is genuinely needed:
 * it streams a multipart file body, which Server Actions don't accept as
 * cleanly. Guarded by the admin session — never expose blob writes publicly.
 *
 * Requires BLOB_READ_WRITE_TOKEN in the environment (auto-set on Vercel when a
 * Blob store is linked; set manually for local dev).
 */

export const runtime = 'nodejs';

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'];

export async function POST(request: Request): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Expected multipart form data.' }, { status: 400 });
  }

  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: 'Unsupported image type.' }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Image exceeds the 8 MB limit.' }, { status: 413 });
  }

  try {
    const blob = await put(file.name || 'upload', file, {
      access: 'public',
      addRandomSuffix: true,
      contentType: file.type,
    });
    return NextResponse.json({ url: blob.url });
  } catch {
    return NextResponse.json({ error: 'Upload failed.' }, { status: 500 });
  }
}
