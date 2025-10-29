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
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { selectedChannel, setSelectedChannel } = useStore()

  useEffect(() => {
    // Check for OAuth success/error messages
    const urlParams = new URLSearchParams(window.location.search)
    const success = urlParams.get('success')
    const errorParam = urlParams.get('error')

    if (success === 'slack_connected') {
      // Fetch channels after successful connection
      fetchChannels()
    }

    if (errorParam) {
      console.error('OAuth error:', errorParam)
      setError(`Authentication failed: ${errorParam}`)
    }
  }, [])

  const fetchChannels = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/slack/channels')

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch channels')
      }

      const data = await response.json()
      setChannels(data.channels)
    } catch (error) {
      console.error('Failed to fetch channels:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch channels')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChannelSelect = async (channel: Channel) => {
    setSelectedChannel(channel)

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/slack/messages?channelId=${channel.id}&limit=50`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch messages')
      }

      const data = await response.json()
      setMessages(data.messages)
    } catch (error) {
      console.error('Failed to fetch messages:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch messages')
    } finally {
      setIsLoading(false)
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
              {isLoading && (
                <span className="text-sm text-muted-foreground">Loading...</span>
              )}
              <span className="text-sm text-muted-foreground">
                Phase 1: Foundation
              </span>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="p-4 bg-destructive/10 border-l-4 border-destructive text-destructive m-4">
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
          {selectedChannel ? (
            isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-muted-foreground">Loading messages...</p>
                </div>
              </div>
            ) : (
              <MessageList messages={messages} />
            )
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
