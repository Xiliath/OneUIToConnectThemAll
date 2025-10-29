'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { MessageList } from '@/components/message-list'
import { useStore } from '@/lib/store'
import type { Channel, Message } from '@/types'

export default function DashboardPage() {
  const router = useRouter()
  const [channels, setChannels] = useState<Channel[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const { selectedChannel, setSelectedChannel } = useStore()

  useEffect(() => {
    // Check for OAuth success/error messages
    const urlParams = new URLSearchParams(window.location.search)
    const success = urlParams.get('success')
    const error = urlParams.get('error')

    if (success === 'slack_connected') {
      // Fetch channels after successful connection
      fetchChannels()
    }

    if (error) {
      console.error('OAuth error:', error)
      // TODO: Show error toast
    }
  }, [])

  const fetchChannels = async () => {
    try {
      // In a real implementation, this would call the API
      // For now, we'll show some example channels
      const exampleChannels: Channel[] = [
        {
          id: 'C1234567890',
          name: 'general',
          platform: 'slack',
          unreadCount: 5,
          isPrivate: false,
        },
        {
          id: 'C0987654321',
          name: 'random',
          platform: 'slack',
          unreadCount: 0,
          isPrivate: false,
        },
        {
          id: 'C1111111111',
          name: 'dev-team',
          platform: 'slack',
          unreadCount: 12,
          isPrivate: true,
        },
      ]
      setChannels(exampleChannels)
    } catch (error) {
      console.error('Failed to fetch channels:', error)
    }
  }

  const handleChannelSelect = async (channel: Channel) => {
    setSelectedChannel(channel)

    try {
      // In a real implementation, this would call the API to fetch messages
      // For now, we'll show some example messages
      const exampleMessages: Message[] = [
        {
          id: '1',
          platform: 'slack',
          content: 'Welcome to the channel!',
          author: {
            id: 'U1234567890',
            name: 'John Doe',
          },
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          channelId: channel.id,
          channelName: channel.name,
        },
        {
          id: '2',
          platform: 'slack',
          content: 'Has anyone seen the latest update?',
          author: {
            id: 'U0987654321',
            name: 'Jane Smith',
          },
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          channelId: channel.id,
          channelName: channel.name,
          reactions: [
            { emoji: '👍', count: 3, users: ['U1', 'U2', 'U3'] },
            { emoji: '👀', count: 1, users: ['U4'] },
          ],
        },
        {
          id: '3',
          platform: 'slack',
          content: 'Yes! It looks great. The new features are working perfectly.',
          author: {
            id: 'U1111111111',
            name: 'Bob Johnson',
          },
          timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
          channelId: channel.id,
          channelName: channel.name,
        },
      ]
      setMessages(exampleMessages)
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  const handleConnectSlack = () => {
    router.push('/api/auth/slack')
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        channels={channels}
        selectedChannel={selectedChannel}
        onChannelSelect={handleChannelSelect}
        onConnectSlack={handleConnectSlack}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              {selectedChannel ? (
                <div>
                  <h1 className="text-xl font-semibold">
                    # {selectedChannel.name}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {selectedChannel.platform} channel
                  </p>
                </div>
              ) : (
                <h1 className="text-xl font-semibold">Welcome to OneUI</h1>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Phase 1: Foundation
              </span>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto">
          {selectedChannel ? (
            <MessageList messages={messages} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">
                  Select a channel to get started
                </h2>
                <p className="text-muted-foreground">
                  Choose a channel from the sidebar to view messages
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
