import { WebClient } from '@slack/web-api'
import { BaseMCPConnector } from './base-connector'
import type { Message, Channel } from '@/types'

export class SlackMCPConnector extends BaseMCPConnector {
  private client: WebClient | null = null
  private accessToken: string | null = null

  constructor() {
    super('slack')
  }

  /**
   * Initialize the Slack client with an access token
   */
  public async connect(): Promise<void> {
    try {
      if (!this.accessToken) {
        throw new Error('No access token provided. Please authenticate first.')
      }

      this.client = new WebClient(this.accessToken)

      // Test the connection
      await this.client.auth.test()

      this.isConnected = true
      console.log('[Slack] Successfully connected')
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
   * Disconnect from Slack
   */
  public async disconnect(): Promise<void> {
    this.client = null
    this.accessToken = null
    this.isConnected = false
    console.log('[Slack] Disconnected')
  }

  /**
   * Get messages from a Slack channel
   */
  public async getMessages(channelId: string, limit: number = 50): Promise<Message[]> {
    try {
      if (!this.client) {
        throw new Error('Not connected. Call connect() first.')
      }

      const result = await this.client.conversations.history({
        channel: channelId,
        limit,
      })

      if (!result.messages) {
        return []
      }

      // Get channel info
      const channelInfo = await this.client.conversations.info({
        channel: channelId,
      })

      return result.messages.map((msg: any) => this.transformMessage(msg, channelId, channelInfo.channel?.name || 'Unknown'))
    } catch (error) {
      this.handleError(error, 'getMessages')
    }
  }

  /**
   * Send a message to a Slack channel
   */
  public async sendMessage(channelId: string, content: string): Promise<Message> {
    try {
      if (!this.client) {
        throw new Error('Not connected. Call connect() first.')
      }

      const result = await this.client.chat.postMessage({
        channel: channelId,
        text: content,
      })

      const channelInfo = await this.client.conversations.info({
        channel: channelId,
      })

      return this.transformMessage(result.message, channelId, channelInfo.channel?.name || 'Unknown')
    } catch (error) {
      this.handleError(error, 'sendMessage')
    }
  }

  /**
   * Get list of Slack channels
   */
  public async getChannels(): Promise<Channel[]> {
    try {
      if (!this.client) {
        throw new Error('Not connected. Call connect() first.')
      }

      const result = await this.client.conversations.list({
        exclude_archived: true,
        types: 'public_channel,private_channel',
      })

      if (!result.channels) {
        return []
      }

      return result.channels.map((channel: any) => ({
        id: channel.id,
        name: channel.name || 'Unknown',
        platform: 'slack' as const,
        unreadCount: channel.unread_count_display || 0,
        isPrivate: channel.is_private || false,
      }))
    } catch (error) {
      this.handleError(error, 'getChannels')
    }
  }

  /**
   * Transform Slack message to our unified format
   */
  private transformMessage(slackMsg: any, channelId: string, channelName: string): Message {
    return {
      id: slackMsg.ts || slackMsg.client_msg_id,
      platform: 'slack',
      content: slackMsg.text || '',
      author: {
        id: slackMsg.user || 'unknown',
        name: slackMsg.username || 'Unknown User',
      },
      timestamp: new Date(parseFloat(slackMsg.ts) * 1000),
      channelId,
      channelName,
      threadId: slackMsg.thread_ts,
      reactions: slackMsg.reactions?.map((r: any) => ({
        emoji: r.name,
        count: r.count,
        users: r.users,
      })),
    }
  }
}

// Export a singleton instance
export const slackConnector = new SlackMCPConnector()
