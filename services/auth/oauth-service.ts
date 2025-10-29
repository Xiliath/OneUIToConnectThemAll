import type { Platform } from '@/types'

export interface OAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  scopes: string[]
}

export interface OAuthTokenResponse {
  accessToken: string
  refreshToken?: string
  expiresIn?: number
  tokenType: string
}

/**
 * OAuth service for handling authentication flows
 */
export class OAuthService {
  private platform: Platform
  private config: OAuthConfig

  constructor(platform: Platform, config: OAuthConfig) {
    this.platform = platform
    this.config = config
  }

  /**
   * Generate the authorization URL for OAuth flow
   */
  getAuthorizationUrl(state?: string): string {
    const authUrls: Record<Platform, string> = {
      slack: 'https://slack.com/oauth/v2/authorize',
      teams: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      outlook: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      other: '',
    }

    const baseUrl = authUrls[this.platform]
    if (!baseUrl) {
      throw new Error(`OAuth not configured for platform: ${this.platform}`)
    }

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(' '),
      ...(state && { state }),
    })

    // Platform-specific parameters
    if (this.platform === 'slack') {
      params.append('user_scope', this.config.scopes.join(','))
    }

    if (this.platform === 'teams' || this.platform === 'outlook') {
      params.append('response_type', 'code')
      params.append('response_mode', 'query')
    }

    return `${baseUrl}?${params.toString()}`
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<OAuthTokenResponse> {
    const tokenUrls: Record<Platform, string> = {
      slack: 'https://slack.com/api/oauth.v2.access',
      teams: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      outlook: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      other: '',
    }

    const tokenUrl = tokenUrls[this.platform]
    if (!tokenUrl) {
      throw new Error(`Token exchange not configured for platform: ${this.platform}`)
    }

    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          code,
          redirect_uri: this.config.redirectUri,
          ...(this.platform === 'slack' ? {} : { grant_type: 'authorization_code' }),
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Token exchange failed: ${error}`)
      }

      const data = await response.json()

      // Platform-specific response handling
      if (this.platform === 'slack') {
        return {
          accessToken: data.authed_user?.access_token || data.access_token,
          tokenType: data.token_type || 'Bearer',
        }
      }

      // Microsoft platforms
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
        tokenType: data.token_type,
      }
    } catch (error) {
      console.error(`[${this.platform}] Token exchange error:`, error)
      throw error
    }
  }

  /**
   * Refresh an expired access token
   */
  async refreshToken(refreshToken: string): Promise<OAuthTokenResponse> {
    if (this.platform === 'slack') {
      throw new Error('Slack does not support token refresh')
    }

    const tokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token'

    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      })

      if (!response.ok) {
        throw new Error('Token refresh failed')
      }

      const data = await response.json()

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
        tokenType: data.token_type,
      }
    } catch (error) {
      console.error(`[${this.platform}] Token refresh error:`, error)
      throw error
    }
  }
}

/**
 * Factory function to create OAuth service for a platform
 */
export function createOAuthService(platform: Platform): OAuthService {
  const configs: Record<Platform, OAuthConfig | null> = {
    slack: {
      clientId: process.env.SLACK_CLIENT_ID || '',
      clientSecret: process.env.SLACK_CLIENT_SECRET || '',
      redirectUri: process.env.SLACK_REDIRECT_URI || '',
      scopes: [
        'channels:history',
        'channels:read',
        'chat:write',
        'users:read',
        'groups:read',
        'groups:history',
        'im:read',
        'im:history',
      ],
    },
    teams: {
      clientId: process.env.MICROSOFT_CLIENT_ID || '',
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
      redirectUri: process.env.MICROSOFT_REDIRECT_URI || '',
      scopes: [
        'User.Read',
        'Chat.Read',
        'Chat.ReadWrite',
        'ChannelMessage.Read.All',
      ],
    },
    outlook: {
      clientId: process.env.MICROSOFT_CLIENT_ID || '',
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
      redirectUri: process.env.MICROSOFT_REDIRECT_URI || '',
      scopes: [
        'User.Read',
        'Mail.Read',
        'Mail.ReadWrite',
        'Mail.Send',
      ],
    },
    other: null,
  }

  const config = configs[platform]
  if (!config) {
    throw new Error(`OAuth not configured for platform: ${platform}`)
  }

  return new OAuthService(platform, config)
}
