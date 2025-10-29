import { Client } from '@microsoft/microsoft-graph-client'
import { BaseMCPConnector } from './base-connector'
import type { Message, Channel } from '@/types'

export class OutlookMCPConnector extends BaseMCPConnector {
  private client: Client | null = null
  private accessToken: string | null = null

  constructor() {
    super('outlook')
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
      console.log('[Outlook] Successfully connected')
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
   * Disconnect from Outlook
   */
  public async disconnect(): Promise<void> {
    this.client = null
    this.accessToken = null
    this.isConnected = false
    console.log('[Outlook] Disconnected')
  }

  /**
   * Get messages from Outlook (using inbox as default "channel")
   */
  public async getMessages(folderId: string = 'inbox', limit: number = 50): Promise<Message[]> {
    try {
      if (!this.client) {
        throw new Error('Not connected. Call connect() first.')
      }

      const response = await this.client
        .api(`/me/mailFolders/${folderId}/messages`)
        .top(limit)
        .orderby('receivedDateTime DESC')
        .select('id,subject,bodyPreview,from,receivedDateTime,conversationId,hasAttachments')
        .get()

      const folderInfo = await this.client.api(`/me/mailFolders/${folderId}`).get()

      return response.value.map((msg: any) => this.transformMessage(msg, folderId, folderInfo.displayName))
    } catch (error) {
      this.handleError(error, 'getMessages')
    }
  }

  /**
   * Send a message (email) via Outlook
   */
  public async sendMessage(to: string, content: string): Promise<Message> {
    try {
      if (!this.client) {
        throw new Error('Not connected. Call connect() first.')
      }

      const message = {
        subject: 'Message from OneUI',
        body: {
          contentType: 'Text',
          content: content,
        },
        toRecipients: [
          {
            emailAddress: {
              address: to,
            },
          },
        ],
      }

      const response = await this.client
        .api('/me/sendMail')
        .post({
          message,
          saveToSentItems: true,
        })

      // Get the sent message from sent items
      const sentMessages = await this.client
        .api('/me/mailFolders/sentitems/messages')
        .top(1)
        .orderby('sentDateTime DESC')
        .get()

      return this.transformMessage(sentMessages.value[0], 'sentitems', 'Sent Items')
    } catch (error) {
      this.handleError(error, 'sendMessage')
    }
  }

  /**
   * Get list of Outlook folders (treating them as "channels")
   */
  public async getChannels(): Promise<Channel[]> {
    try {
      if (!this.client) {
        throw new Error('Not connected. Call connect() first.')
      }

      const response = await this.client
        .api('/me/mailFolders')
        .select('id,displayName,unreadItemCount,totalItemCount')
        .get()

      return response.value.map((folder: any) => ({
        id: folder.id,
        name: folder.displayName,
        platform: 'outlook' as const,
        unreadCount: folder.unreadItemCount || 0,
        isPrivate: true, // Email folders are private by default
      }))
    } catch (error) {
      this.handleError(error, 'getChannels')
    }
  }

  /**
   * Transform Outlook message to our unified format
   */
  private transformMessage(outlookMsg: any, folderId: string, folderName: string): Message {
    return {
      id: outlookMsg.id,
      platform: 'outlook',
      content: outlookMsg.bodyPreview || outlookMsg.subject || '',
      author: {
        id: outlookMsg.from?.emailAddress?.address || 'unknown',
        name: outlookMsg.from?.emailAddress?.name || 'Unknown User',
      },
      timestamp: new Date(outlookMsg.receivedDateTime || outlookMsg.sentDateTime),
      channelId: folderId,
      channelName: folderName,
      threadId: outlookMsg.conversationId,
      attachments: outlookMsg.hasAttachments
        ? [
            {
              id: 'attachment',
              type: 'file' as const,
              url: '#',
              name: 'Attachments available',
            },
          ]
        : undefined,
    }
  }
}

// Export a singleton instance
export const outlookConnector = new OutlookMCPConnector()
