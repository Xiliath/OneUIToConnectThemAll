import { NextRequest, NextResponse } from 'next/server'
import { outlookConnector } from '@/services/mcp'

/**
 * GET /api/outlook/status
 * Checks if the user is authenticated with Outlook
 */
export async function GET(request: NextRequest) {
  try {
    // Get the Outlook token from the cookie
    const outlookToken = request.cookies.get('outlook_token')?.value

    if (!outlookToken) {
      return NextResponse.json(
        { isAuthenticated: false },
        { status: 200 }
      )
    }

    // Try to verify the token by connecting
    try {
      outlookConnector.setAccessToken(outlookToken)

      if (!outlookConnector.isConnected) {
        await outlookConnector.connect()
      }

      return NextResponse.json(
        { isAuthenticated: true },
        { status: 200 }
      )
    } catch (error) {
      // Token is invalid or expired
      console.error('Outlook token validation failed:', error)
      return NextResponse.json(
        { isAuthenticated: false },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error('Error checking Outlook status:', error)
    return NextResponse.json(
      { isAuthenticated: false },
      { status: 200 }
    )
  }
}
