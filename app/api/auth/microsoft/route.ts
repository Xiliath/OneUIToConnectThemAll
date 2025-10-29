import { NextRequest, NextResponse } from 'next/server'
import { createOAuthService } from '@/services/auth'
import type { Platform } from '@/types'

/**
 * GET /api/auth/microsoft?platform=teams|outlook
 * Initiates the Microsoft OAuth flow for Teams or Outlook
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const platform = searchParams.get('platform') as Platform

    if (platform !== 'teams' && platform !== 'outlook') {
      return NextResponse.json(
        { error: 'Invalid platform. Must be "teams" or "outlook"' },
        { status: 400 }
      )
    }

    const oauthService = createOAuthService(platform)

    // Generate a random state for CSRF protection
    const state = Math.random().toString(36).substring(7)

    // Store state and platform in a cookie for verification later
    const authUrl = oauthService.getAuthorizationUrl(state)

    // Redirect to Microsoft authorization page
    return NextResponse.redirect(authUrl, {
      headers: {
        'Set-Cookie': `oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600, oauth_platform=${platform}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`,
      },
    })
  } catch (error) {
    console.error('Microsoft OAuth initiation error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate OAuth flow' },
      { status: 500 }
    )
  }
}
