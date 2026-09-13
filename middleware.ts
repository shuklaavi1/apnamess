import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const DEFAULT_SUPABASE_URL = 'https://bhntfblikfphiaxcukdr.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_Oj_JHlf7u1jC5Wm72UnywA_HGvLH8yE';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl =
    (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.trim() !== '')
      ? process.env.NEXT_PUBLIC_SUPABASE_URL
      : DEFAULT_SUPABASE_URL;

  const supabaseKey =
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.trim() !== '')
      ? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
      : (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim() !== '')
      ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      : DEFAULT_SUPABASE_KEY;

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/reset-password';
    const isProtectedPage = pathname === '/' || pathname.startsWith('/people') || pathname === '/history';

    if (!user && isProtectedPage) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    if (user && isAuthPage) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  } catch (err) {
    // If Supabase auth check fails in middleware, fail safely to default response
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
