import { NextRequest, NextResponse } from 'next/server'
import { teamsConnector } from '@/services/mcp'

/**
 * GET /api/teams/channels
 * Fetches the list of Teams channels for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Get the Teams token from the cookie
    const teamsToken = request.cookies.get('teams_token')?.value

    if (!teamsToken) {
      return NextResponse.json(
        { error: 'Not authenticated with Teams' },
        { status: 401 }
      )
    }

    // Initialize the Teams connector with the token
    teamsConnector.setAccessToken(teamsToken)

    if (!teamsConnector.isConnected) {
      await teamsConnector.connect()
    }

    // Fetch channels from Teams
    const channels = await teamsConnector.getChannels()

    return NextResponse.json({ channels })
  } catch (error) {
    console.error('Error fetching Teams channels:', error)
    return NextResponse.json(
      { error: 'Failed to fetch channels' },
      { status: 500 }
    )
  }
}
