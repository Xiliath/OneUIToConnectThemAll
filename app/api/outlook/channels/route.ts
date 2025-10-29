import { NextRequest, NextResponse } from 'next/server'
import { outlookConnector } from '@/services/mcp'

/**
 * GET /api/outlook/channels
 * Fetches the list of Outlook folders (treated as channels) for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Get the Outlook token from the cookie
    const outlookToken = request.cookies.get('outlook_token')?.value

    if (!outlookToken) {
      return NextResponse.json(
        { error: 'Not authenticated with Outlook' },
        { status: 401 }
      )
    }

    // Initialize the Outlook connector with the token
    outlookConnector.setAccessToken(outlookToken)

    if (!outlookConnector.isConnected) {
      await outlookConnector.connect()
    }

    // Fetch folders (channels) from Outlook
    const channels = await outlookConnector.getChannels()

    return NextResponse.json({ channels })
  } catch (error) {
    console.error('Error fetching Outlook folders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch folders' },
      { status: 500 }
    )
  }
}
