import Link from 'next/link'
import { MessageSquare, Slack, Mail, Users } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            🪄 OneUI to Connect Them All
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 italic">
            "In the age of scattered communication — one interface to unify them."
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 mb-8">
          <h2 className="text-3xl font-semibold mb-6 text-gray-800 dark:text-white">
            Phase 2: Core Features Complete!
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            OneUI is a universal interface that brings together Outlook, Teams, Slack,
            and other communication platforms into one intuitive user experience with
            AI-powered features.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="border border-green-200 dark:border-green-700 rounded-lg p-6 bg-green-50 dark:bg-green-900/20">
              <div className="flex items-center mb-4">
                <Slack className="w-8 h-8 text-blue-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Slack Integration
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Connect to your Slack workspaces and view messages in a unified interface.
              </p>
            </div>

            <div className="border border-green-200 dark:border-green-700 rounded-lg p-6 bg-green-50 dark:bg-green-900/20">
              <div className="flex items-center mb-4">
                <Mail className="w-8 h-8 text-blue-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Outlook
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Access your emails and folders through the unified interface.
              </p>
            </div>

            <div className="border border-green-200 dark:border-green-700 rounded-lg p-6 bg-green-50 dark:bg-green-900/20">
              <div className="flex items-center mb-4">
                <Users className="w-8 h-8 text-blue-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Teams
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                View and manage Teams channels and messages.
              </p>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <MessageSquare className="w-8 h-8 text-blue-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  AI Features
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                AI-powered summaries, search, and filtering
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/dashboard"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>

        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 mb-8">
          <h3 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
            Phase 1 - Foundation (Q1 2025) ✓
          </h3>
          <ul className="space-y-2 text-gray-600 dark:text-gray-300">
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Setup project architecture
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Implement basic UI framework
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Develop first MCP-connector (Slack)
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Basic authentication system
            </li>
          </ul>
        </div>

        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          <h3 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
            Phase 2 - Core Features (Q2 2025) ✓
          </h3>
          <ul className="space-y-2 text-gray-600 dark:text-gray-300">
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Outlook & Teams MCP-connectoren
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Context Engine met AI-integratie
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Unified messaging interface
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Zoek- en filterfunctionaliteit
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
