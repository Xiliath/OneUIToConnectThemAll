import { Client } from '@microsoft/microsoft-graph-client'
import { BaseMCPConnector } from './base-connector'
import type { Message, Channel } from '@/types'

export class TeamsMCPConnector extends BaseMCPConnector {
  private client: Client | null = null
  private accessToken: string | null = null

  constructor() {
    super('teams')
  }

  /**
   * Initialize the Microsoft Graph client with an access token
   */
  public async connect(): Promise<void> {
    try {
      if (!this.accessToken) {
        throw new Error('No access token provided. Please authenticate first.')
      }

      this.client = Client.init({
        authProvider: (done) => {
          done(null, this.accessToken!)
        },
      })

      // Test the connection
      await this.client.api('/me').get()

      this.isConnected = true
      console.log('[Teams] Successfully connected')
    } catch (error) {
      this.handleError(error, 'connect')
    }
  }

  /**
   * Set the access token for authentication
   */
  public setAccessToken(token: string): void {
    this.accessToken = token
  }

  /**
   * Disconnect from Teams
   */
  public async disconnect(): Promise<void> {
    this.client = null
    this.accessToken = null
    this.isConnected = false
    console.log('[Teams] Disconnected')
  }

  /**
   * Get messages from a Teams channel
   */
  public async getMessages(channelId: string, limit: number = 50): Promise<Message[]> {
    try {
      if (!this.client) {
        throw new Error('Not connected. Call connect() first.')
      }

      // Parse channelId which should be in format: teamId/channelId
      const [teamId, actualChannelId] = channelId.split('/')

      if (!teamId || !actualChannelId) {
        throw new Error('Invalid channel ID format. Expected: teamId/channelId')
      }

      const response = await this.client
        .api(`/teams/${teamId}/channels/${actualChannelId}/messages`)
        .top(limit)
        .get()

      // Get channel info
      const channelInfo = await this.client
        .api(`/teams/${teamId}/channels/${actualChannelId}`)
        .get()

      return response.value.map((msg: any) => this.transformMessage(msg, channelId, channelInfo.displayName))
    } catch (error) {
      this.handleError(error, 'getMessages')
    }
  }

  /**
   * Send a message to a Teams channel
   */
  public async sendMessage(channelId: string, content: string): Promise<Message> {
    try {
      if (!this.client) {
        throw new Error('Not connected. Call connect() first.')
      }

      // Parse channelId which should be in format: teamId/channelId
      const [teamId, actualChannelId] = channelId.split('/')

      if (!teamId || !actualChannelId) {
        throw new Error('Invalid channel ID format. Expected: teamId/channelId')
      }

      const message = {
        body: {
          content: content,
        },
      }

      const response = await this.client
        .api(`/teams/${teamId}/channels/${actualChannelId}/messages`)
        .post(message)

      // Get channel info
      const channelInfo = await this.client
        .api(`/teams/${teamId}/channels/${actualChannelId}`)
        .get()

      return this.transformMessage(response, channelId, channelInfo.displayName)
    } catch (error) {
      this.handleError(error, 'sendMessage')
    }
  }

  /**
   * Get list of Teams channels
   */
  public async getChannels(): Promise<Channel[]> {
    try {
      if (!this.client) {
        throw new Error('Not connected. Call connect() first.')
      }

      // First, get all teams the user is a member of
      const teamsResponse = await this.client
        .api('/me/joinedTeams')
        .get()

      const allChannels: Channel[] = []

      // For each team, get its channels
      for (const team of teamsResponse.value) {
        try {
          const channelsResponse = await this.client
            .api(`/teams/${team.id}/channels`)
            .get()

          const teamChannels = channelsResponse.value.map((channel: any) => ({
            id: `${team.id}/${channel.id}`,
            name: `${team.displayName} > ${channel.displayName}`,
            platform: 'teams' as const,
            unreadCount: 0, // Teams API doesn't provide unread count easily
            isPrivate: channel.membershipType === 'private',
          }))

          allChannels.push(...teamChannels)
        } catch (error) {
          console.warn(`[Teams] Failed to get channels for team ${team.id}:`, error)
        }
      }

      return allChannels
    } catch (error) {
      this.handleError(error, 'getChannels')
    }
  }

  /**
   * Transform Teams message to our unified format
   */
  private transformMessage(teamsMsg: any, channelId: string, channelName: string): Message {
    return {
      id: teamsMsg.id,
      platform: 'teams',
      content: teamsMsg.body?.content || '',
      author: {
        id: teamsMsg.from?.user?.id || 'unknown',
        name: teamsMsg.from?.user?.displayName || 'Unknown User',
      },
      timestamp: new Date(teamsMsg.createdDateTime),
      channelId,
      channelName,
      threadId: teamsMsg.replyToId,
      attachments: teamsMsg.attachments?.map((att: any) => ({
        id: att.id,
        type: this.getAttachmentType(att.contentType),
        url: att.contentUrl || '#',
        name: att.name || 'Attachment',
      })),
    }
  }

  /**
   * Helper to determine attachment type
   */
  private getAttachmentType(contentType: string): 'image' | 'file' | 'link' {
    if (contentType?.startsWith('image/')) return 'image'
    if (contentType?.includes('link')) return 'link'
    return 'file'
  }
}

// Export a singleton instance
export const teamsConnector = new TeamsMCPConnector()
