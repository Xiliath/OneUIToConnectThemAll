import { BaseMCPConnector } from '@/services/mcp/base-connector'
import type { Message, Channel } from '@/types'

class TestConnector extends BaseMCPConnector {
  constructor() {
    super('slack')
  }

  async connect(): Promise<void> {
    this.isConnected = true
  }

  async disconnect(): Promise<void> {
    this.isConnected = false
  }

  async getMessages(): Promise<Message[]> {
    return []
  }

  async sendMessage(): Promise<Message> {
    throw new Error('Not implemented')
  }

  async getChannels(): Promise<Channel[]> {
    return []
  }
}

describe('BaseMCPConnector', () => {
  let connector: TestConnector

  beforeEach(() => {
    connector = new TestConnector()
  })

  it('should initialize with correct platform', () => {
    expect(connector.platform).toBe('slack')
  })

  it('should start disconnected', () => {
    expect(connector.isConnected).toBe(false)
  })

  it('should connect successfully', async () => {
    await connector.connect()
    expect(connector.isConnected).toBe(true)
  })

  it('should disconnect successfully', async () => {
    await connector.connect()
    await connector.disconnect()
    expect(connector.isConnected).toBe(false)
  })
})
