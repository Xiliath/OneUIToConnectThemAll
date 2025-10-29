'use client'

import { format } from 'date-fns'
import type { Message } from '@/types'
import { Card, CardContent } from '@/components/ui/card'

interface MessageListProps {
  messages: Message[]
}

export function MessageList({ messages }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No messages to display. Select a channel to view messages.
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4">
      {messages.map((message) => (
        <Card key={message.id}>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">
                    {message.author.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-sm">
                    {message.author.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(message.timestamp), 'PPp')}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                    {message.platform}
                  </span>
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {message.content}
                </p>
                {message.reactions && message.reactions.length > 0 && (
                  <div className="flex items-center space-x-2 mt-2">
                    {message.reactions.map((reaction, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 rounded-full bg-muted"
                      >
                        {reaction.emoji} {reaction.count}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
