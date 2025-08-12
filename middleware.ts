import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Si hay token y está intentando acceder a Login o Home, redirigir a su dashboard
    if (token && (pathname.startsWith('/Login') || pathname === '/')) {
      const userRole = token.rol
      console.log('🔄 Authenticated user trying to access login/home, redirecting:', userRole)
      
      switch (userRole) {
        case 'PROFESOR':
          return NextResponse.redirect(new URL('/Teachers', req.url))
        case 'ESTUDIANTE':
          return NextResponse.redirect(new URL('/Students', req.url))
        case 'ADMIN':
          return NextResponse.redirect(new URL('/Admin', req.url))
        default:
          return NextResponse.redirect(new URL('/', req.url))
      }
    }

    // Si no hay token y está tratando de acceder a rutas protegidas
    if (!token && (pathname.startsWith('/Teachers') || pathname.startsWith('/Students') || pathname.startsWith('/Admin'))) {
      return NextResponse.redirect(new URL('/Login', req.url))
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
