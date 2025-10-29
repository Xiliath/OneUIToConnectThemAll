import { NextRequest, NextResponse } from 'next/server'
import { createOAuthService } from '@/services/auth'
import { slackConnector } from '@/services/mcp'

/**
 * GET /api/auth/slack/callback
 * Handles the OAuth callback from Slack
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Check for OAuth errors
    if (error) {
      console.error('Slack OAuth error:', error)
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

    // Exchange code for access token
    const oauthService = createOAuthService('slack')
    const tokenResponse = await oauthService.exchangeCodeForToken(code)

    // Initialize Slack connector with the access token
    slackConnector.setAccessToken(tokenResponse.accessToken)
    await slackConnector.connect()

    // Store token securely (in a real app, use a secure session or database)
    // For now, we'll redirect with a success message
    const response = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=slack_connected`
    )

    // Set the access token in a secure cookie
    response.cookies.set('slack_token', tokenResponse.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 90, // 90 days
      path: '/',
    })

    // Clear the state cookie
    response.cookies.delete('oauth_state')

    return response
  } catch (error) {
    console.error('Slack OAuth callback error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=token_exchange_failed`
    )
  }
}
