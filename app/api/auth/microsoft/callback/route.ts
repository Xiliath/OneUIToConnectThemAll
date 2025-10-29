import { NextRequest, NextResponse } from 'next/server'
import { createOAuthService } from '@/services/auth'
import { outlookConnector, teamsConnector } from '@/services/mcp'
import type { Platform } from '@/types'

/**
 * GET /api/auth/microsoft/callback
 * Handles the OAuth callback from Microsoft
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Check for OAuth errors
    if (error) {
      console.error('Microsoft OAuth error:', error)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=oauth_failed`
      )
    }

    // Verify code exists
    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=no_code`
      )
    }

    // Verify state (CSRF protection)
    const storedState = request.cookies.get('oauth_state')?.value
    if (!storedState || storedState !== state) {
      console.error('State mismatch - possible CSRF attack')
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=invalid_state`
      )
    }

    // Get the platform from cookies
    const platform = request.cookies.get('oauth_platform')?.value as Platform
    if (!platform || (platform !== 'teams' && platform !== 'outlook')) {
      console.error('Invalid or missing platform in cookie')
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=invalid_platform`
      )
    }

    // Exchange code for access token
    const oauthService = createOAuthService(platform)
    const tokenResponse = await oauthService.exchangeCodeForToken(code)

    // Initialize the appropriate connector with the access token
    if (platform === 'teams') {
      teamsConnector.setAccessToken(tokenResponse.accessToken)
      await teamsConnector.connect()
    } else if (platform === 'outlook') {
      outlookConnector.setAccessToken(tokenResponse.accessToken)
      await outlookConnector.connect()
    }

    // Store token securely (in a real app, use a secure session or database)
    const response = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=${platform}_connected`
    )

    // Set the access token in a secure cookie
    response.cookies.set(`${platform}_token`, tokenResponse.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokenResponse.expiresIn || 60 * 60, // Use token expiry or default to 1 hour
      path: '/',
    })

    // Store refresh token if available
    if (tokenResponse.refreshToken) {
      response.cookies.set(`${platform}_refresh_token`, tokenResponse.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 90, // 90 days
        path: '/',
      })
    }

    // Clear the state and platform cookies
    response.cookies.delete('oauth_state')
    response.cookies.delete('oauth_platform')

    return response
  } catch (error) {
    console.error('Microsoft OAuth callback error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=token_exchange_failed`
    )
  }
}
