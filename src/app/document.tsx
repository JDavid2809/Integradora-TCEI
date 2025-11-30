'use client'

import React from 'react'

export default function Document({ children }:{ children: React.ReactNode }) {
  return (
    <html lang="es">
      <head />
      <body>{children}</body>
    </html>
  )
}
