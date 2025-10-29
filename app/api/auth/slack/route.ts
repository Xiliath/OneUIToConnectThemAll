import { NextRequest, NextResponse } from 'next/server'
import { createOAuthService } from '@/services/auth'

/**
 * GET /api/auth/slack
 * Initiates the Slack OAuth flow
 */
export async function GET(request: NextRequest) {
  try {
    const oauthService = createOAuthService('slack')

    // Generate a random state for CSRF protection
    const state = Math.random().toString(36).substring(7)

    // Store state in a cookie for verification later
    const authUrl = oauthService.getAuthorizationUrl(state)

    // Redirect to Slack authorization page
    return NextResponse.redirect(authUrl, {
      headers: {
        'Set-Cookie': `oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`,
      },
    })
  } catch (error) {
    console.error('Slack OAuth initiation error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate OAuth flow' },
      { status: 500 }
    )
  }
}
