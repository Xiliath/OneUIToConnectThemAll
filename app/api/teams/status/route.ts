import { NextRequest, NextResponse } from 'next/server'
import { teamsConnector } from '@/services/mcp'

/**
 * GET /api/teams/status
 * Checks if the user is authenticated with Teams
 */
export async function GET(request: NextRequest) {
  try {
    // Get the Teams token from the cookie
    const teamsToken = request.cookies.get('teams_token')?.value

    if (!teamsToken) {
      return NextResponse.json(
        { isAuthenticated: false },
        { status: 200 }
      )
    }

    // Try to verify the token by connecting
    try {
      teamsConnector.setAccessToken(teamsToken)

      if (!teamsConnector.isConnected) {
        await teamsConnector.connect()
      }

      return NextResponse.json(
        { isAuthenticated: true },
        { status: 200 }
      )
    } catch (error) {
      // Token is invalid or expired
      console.error('Teams token validation failed:', error)
      return NextResponse.json(
        { isAuthenticated: false },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error('Error checking Teams status:', error)
    return NextResponse.json(
      { isAuthenticated: false },
      { status: 200 }
    )
  }
}
