// Platform types
export type Platform = 'slack' | 'teams' | 'outlook' | 'other'

// Message types
export interface Message {
  id: string
  platform: Platform
  content: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  timestamp: Date
  threadId?: string
  channelId: string
  channelName: string
  reactions?: Reaction[]
  attachments?: Attachment[]
}

export interface Reaction {
  emoji: string
  count: number
  users: string[]
}

export interface Attachment {
  id: string
  type: 'image' | 'file' | 'link'
  url: string
  name: string
  size?: number
}

// Channel types
export interface Channel {
  id: string
  name: string
  platform: Platform
  unreadCount: number
  lastMessage?: Message
  isPrivate: boolean
  members?: string[]
}

// Authentication types
export interface AuthToken {
  accessToken: string
  refreshToken?: string
  expiresAt: Date
  platform: Platform
}

export interface UserAuth {
  platform: Platform
  userId: string
  teamId?: string
  isAuthenticated: boolean
  token?: AuthToken
}

// MCP Connector types
export interface MCPConnector {
  platform: Platform
  isConnected: boolean
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  getMessages: (channelId: string, limit?: number) => Promise<Message[]>
  sendMessage: (channelId: string, content: string) => Promise<Message>
  getChannels: () => Promise<Channel[]>
}

// Store types
export interface AppState {
  // Auth state
  auth: {
    [K in Platform]?: UserAuth
  }

  // Messages state
  messages: Message[]
  selectedChannel: Channel | null

  // UI state
  isLoading: boolean
  error: string | null
  theme: 'light' | 'dark'

  // Actions
  setAuth: (platform: Platform, auth: UserAuth) => void
  clearAuth: (platform: Platform) => void
  setMessages: (messages: Message[]) => void
  addMessage: (message: Message) => void
  setSelectedChannel: (channel: Channel | null) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  toggleTheme: () => void
}
