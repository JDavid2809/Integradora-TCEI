import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Si hay token y está intentando acceder a Login o Home, redirigir a su dashboard
    if (token && (pathname.startsWith('/Login') || pathname === '/')) {
      const userRole = token.rol
      console.log('Authenticated user trying to access login/home, redirecting:', userRole)
      
      const redirectUrl = userRole === 'PROFESOR' ? '/Teachers' :
                         userRole === 'ESTUDIANTE' ? '/Students' :
                         userRole === 'ADMIN' ? '/Admin' : '/'
      
      const response = NextResponse.redirect(new URL(redirectUrl, req.url))
      
      // Agregar headers para prevenir caché
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')
      
      return response
    }

    // Si no hay token y está tratando de acceder a rutas protegidas
    if (!token && (pathname.startsWith('/Teachers') || pathname.startsWith('/Students') || pathname.startsWith('/Admin'))) {
      const response = NextResponse.redirect(new URL('/Login', req.url))
      
      // Prevenir caché en páginas de login
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')
      
      return response
    }

    // Si hay token, verificar permisos de rol
    if (token) {
      const userRole = token.rol

      // Profesor intentando acceder a ruta de Estudiante
      if (userRole === 'PROFESOR' && pathname.startsWith('/Students')) {
        return NextResponse.redirect(new URL('/Teachers', req.url))
      }

      // Estudiante intentando acceder a ruta de Profesor
      if (userRole === 'ESTUDIANTE' && pathname.startsWith('/Teachers')) {
        return NextResponse.redirect(new URL('/Students', req.url))
      }

      // Cualquier usuario (no admin) intentando acceder a Admin
      if (userRole !== 'ADMIN' && pathname.startsWith('/Admin')) {
        // Redirigir según su rol
        if (userRole === 'PROFESOR') {
          return NextResponse.redirect(new URL('/Teachers', req.url))
        }
        if (userRole === 'ESTUDIANTE') {
          return NextResponse.redirect(new URL('/Students', req.url))
        }
        return NextResponse.redirect(new URL('/Login', req.url))
      }

      // Admin intentando acceder a rutas de Profesor o Estudiante
      if (userRole === 'ADMIN' && (pathname.startsWith('/Teachers') || pathname.startsWith('/Students'))) {
        return NextResponse.redirect(new URL('/Admin', req.url))
      }
    }

    // Para páginas protegidas, agregar headers de no-caché
    if (pathname.startsWith('/Teachers') || pathname.startsWith('/Students') || pathname.startsWith('/Admin')) {
      const response = NextResponse.next()
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')
      return response
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => true // Permitir acceso para verificar en middleware
    },
  }
)

export const config = {
  matcher: [
    '/',
    '/Teachers/:path*',
    '/Students/:path*', 
    '/Admin/:path*',
    '/Login'
  ]
}
