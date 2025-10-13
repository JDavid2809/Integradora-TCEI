import { NextRequest, NextResponse } from 'next/server'

// Redirección a /api/admin/system/levels para mantener compatibilidad
export async function GET(request: NextRequest) {
  const url = request.url.replace('/api/admin/levels', '/api/admin/system/levels')
  return NextResponse.redirect(new URL(url, request.url))
}

export async function POST(request: NextRequest) {
  const url = request.url.replace('/api/admin/levels', '/api/admin/system/levels')
  return NextResponse.redirect(new URL(url, request.url))
}

export async function PUT(request: NextRequest) {
  const url = request.url.replace('/api/admin/levels', '/api/admin/system/levels')
  return NextResponse.redirect(new URL(url, request.url))
}

export async function DELETE(request: NextRequest) {
  const url = request.url.replace('/api/admin/levels', '/api/admin/system/levels')
  return NextResponse.redirect(new URL(url, request.url))
}