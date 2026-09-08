import { NextRequest, NextResponse } from 'next/server';
import { guardarTokensAPartirDeCode } from '@/lib/google';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  if (!code) {
    return NextResponse.redirect(new URL('/ligar-google?erro=sem_code', req.url));
  }

  try {
    await guardarTokensAPartirDeCode(code);
    return NextResponse.redirect(new URL('/?google=ligado', req.url));
  } catch (err) {
    console.error(err);
    return NextResponse.redirect(new URL('/ligar-google?erro=falha', req.url));
  }
}
