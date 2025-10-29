'use client'

import { useState, useMemo } from 'react'
import { Search, Filter, Sparkles } from 'lucide-react'
import type { Message, Platform } from '@/types'
import { MessageList } from './message-list'
import { Button } from './ui/button'
import { Input } from './ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

interface UnifiedMessagingProps {
  messages: Message[]
  onSummarize?: () => void
  isAIEnabled?: boolean
}

export function UnifiedMessaging({
  messages,
  onSummarize,
  isAIEnabled = false,
}: UnifiedMessagingProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [platformFilter, setPlatformFilter] = useState<Platform | 'all'>('all')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')

  // Filter and search messages
  const filteredMessages = useMemo(() => {
    let filtered = messages

    // Filter by platform
    if (platformFilter !== 'all') {
      filtered = filtered.filter((msg) => msg.platform === platformFilter)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (msg) =>
          msg.content.toLowerCase().includes(query) ||
          msg.author.name.toLowerCase().includes(query) ||
          msg.channelName.toLowerCase().includes(query)
      )
    }

    // Sort messages
    filtered = [...filtered].sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime()
      const dateB = new Date(b.timestamp).getTime()
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
    })

    return filtered
  }, [messages, searchQuery, platformFilter, sortOrder])

  // Get platform statistics
  const platformStats = useMemo(() => {
    const stats = new Map<Platform, number>()
    messages.forEach((msg) => {
      stats.set(msg.platform, (stats.get(msg.platform) || 0) + 1)
    })
    return stats
  }, [messages])

  return (
    <div className="flex flex-col h-full">
      {/* Header with controls */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Unified Messages</span>
            {isAIEnabled && (
              <Button
                onClick={onSummarize}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                AI Summary
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages, authors, or channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Select
                value={platformFilter}
                onValueChange={(value) => setPlatformFilter(value as Platform | 'all')}
              >
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All Platforms ({messages.length})
                  </SelectItem>
                  {Array.from(platformStats.entries()).map(([platform, count]) => (
                    <SelectItem key={platform} value={platform}>
                      {platform.charAt(0).toUpperCase() + platform.slice(1)} ({count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <Select
                value={sortOrder}
                onValueChange={(value) => setSortOrder(value as 'newest' | 'oldest')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results count */}
          <div className="text-sm text-muted-foreground">
            Showing {filteredMessages.length} of {messages.length} messages
          </div>
        </CardContent>
      </Card>

      {/* Messages list */}
      <div className="flex-1 overflow-auto">
        <MessageList messages={filteredMessages} />
      </div>
    </div>
  )
}
