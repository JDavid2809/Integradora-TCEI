import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Health Check API Endpoint
 * GET /api/health
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Test database connection
    await prisma.$connect()
    await prisma.$queryRaw`SELECT 1`
    const dbLatency = Date.now() - startTime
    
    // Get system info
    const memUsage = process.memoryUsage()
    const uptime = process.uptime()
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.1.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: Math.floor(uptime),
      database: {
        status: 'connected',
        latency: `${dbLatency}ms`
      },
      memory: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024),
        total: Math.round(memUsage.heapTotal / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024)
      },
      node_version: process.version
    }

    return NextResponse.json(healthData, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      uptime: Math.floor(process.uptime())
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } finally {
    await prisma.$disconnect()
  }
}