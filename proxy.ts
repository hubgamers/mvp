// proxy.ts
"use server"
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Création du client Supabase pour gérer la session via les cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Récupération de l'utilisateur connecté via Supabase
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Définissez les routes protégées
  const protectedRoutes = ['/dashboard', '/profile', '/settings']
  const currentPath = request.nextUrl.pathname

  const isProtected = protectedRoutes.some((route) => currentPath.startsWith(route))

  // Si l'utilisateur tente d'accéder à une route protégée sans être connecté
  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('authRequired', 'true')
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Exclut les fichiers statiques (images, css, favicon) pour ne filtrer que les routes applicatives.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}