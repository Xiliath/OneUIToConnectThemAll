import type { MCPConnector, Platform, Message, Channel } from '@/types'

/**
 * Base class for MCP connectors
 * All platform connectors should extend this class
 */
export abstract class BaseMCPConnector implements MCPConnector {
  public platform: Platform
  public isConnected: boolean = false

  constructor(platform: Platform) {
    this.platform = platform
  }

  /**
   * Connect to the platform
   */
  abstract connect(): Promise<void>

  /**
   * Disconnect from the platform
   */
  abstract disconnect(): Promise<void>

  /**
   * Get messages from a channel
   */
  abstract getMessages(channelId: string, limit?: number): Promise<Message[]>

  /**
   * Send a message to a channel
   */
  abstract sendMessage(channelId: string, content: string): Promise<Message>

  /**
   * Get list of channels
   */
  abstract getChannels(): Promise<Channel[]>

  /**
   * Handle errors in a consistent way
   */
  protected handleError(error: unknown, context: string): never {
    console.error(`[${this.platform}] Error in ${context}:`, error)
    throw new Error(`${this.platform} connector error: ${context}`)
  }
}
