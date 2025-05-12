// This is a server component
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import DocsContent from './DocsContent';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

// Read the README.md file from the root of the project at build time
const readmePath = path.resolve(process.cwd(), 'README.md')
const readmeContent = fs.readFileSync(readmePath, 'utf-8')

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <header className="sticky top-0 bg-white shadow-sm z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link 
                href="/"
                className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
              >
                <ChevronLeftIcon className="h-5 w-5 mr-1" />
                Back to App
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Documentation</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="prose-lg max-w-none bg-white shadow-md rounded-xl p-8">
          <DocsContent content={readmeContent} />
        </article>
      </main>

      {/* Footer */}
      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>Created with ❤️ by <a href="https://github.com/bilalmohib" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">@bilalmohib</a></p>
      </footer>
    </div>
  )
} 