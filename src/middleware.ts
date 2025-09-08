import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const expected = process.env.APP_PASSWORD || process.env.NEXT_PUBLIC_APP_PASSWORD;
  if (expected) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${expected}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
