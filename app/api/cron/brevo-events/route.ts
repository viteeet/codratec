import { NextResponse } from 'next/server';
import { syncBrevoEmailEvents } from '@/actions/os';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  const auth = request.headers.get('authorization') || '';
  const vercelCron = request.headers.get('x-vercel-cron');
  const ok =
    Boolean(vercelCron) ||
    (secret ? auth === `Bearer ${secret}` : process.env.NODE_ENV !== 'production');

  if (!ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await syncBrevoEmailEvents(7);
  if (result && 'error' in result && result.error) {
    return NextResponse.json(result, { status: 500 });
  }
  return NextResponse.json(result);
}
