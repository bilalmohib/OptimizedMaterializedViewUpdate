'use client'

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeHighlight from 'rehype-highlight'
import { Components } from 'react-markdown'

// Import syntax highlighting CSS
import './highlight.css'

interface DocsContentProps {
  content: string
}

export default function DocsContent({ content }: DocsContentProps) {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.body.scrollHeight - window.innerHeight
      const progress = (window.scrollY / totalHeight) * 100
      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Define custom components with proper typing
  const components: Components = {
    h1: ({ node, ...props }) => (
      <h1 className="text-3xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200" {...props} />
    ),
    h2: ({ node, ...props }) => (
      <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4 pb-1 border-b border-gray-100" {...props} />
    ),
    h3: ({ node, ...props }) => (
      <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-3" {...props} />
    ),
    p: ({ node, ...props }) => (
      <p className="my-4 text-gray-700 leading-relaxed" {...props} />
    ),
    ul: ({ node, ...props }) => (
      <ul className="my-6 list-disc pl-8 space-y-2 text-gray-700" {...props} />
    ),
    ol: ({ node, ...props }) => (
      <ol className="my-6 list-decimal pl-8 space-y-2 text-gray-700" {...props} />
    ),
    li: ({ node, ...props }) => (
      <li className="mb-1" {...props} />
    ),
    a: ({ node, ...props }) => (
      <a className="text-blue-600 hover:text-blue-800 underline" {...props} />
    ),
    code: ({ node, inline, className, children, ...props }: any) => {
      if (inline) {
        return (
          <code className="bg-gray-100 text-blue-700 px-1 py-0.5 rounded text-sm font-mono" {...props}>
            {children}
          </code>
        )
      }
      return (
        <div className="bg-gray-800 rounded-md overflow-hidden my-6 shadow-lg">
          <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-700 bg-gray-900 flex justify-between items-center">
            <span>{className?.replace(/language-/, '') || 'code'}</span>
          </div>
          <pre className="p-4 overflow-x-auto">
            <code className={`${className} text-sm font-mono text-gray-200`} {...props}>
              {children}
            </code>
          </pre>
        </div>
      )
    },
    table: ({ node, ...props }) => (
      <div className="my-8 overflow-x-auto shadow-md rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-300" {...props} />
      </div>
    ),
    thead: ({ node, ...props }) => (
      <thead className="bg-gray-50" {...props} />
    ),
    th: ({ node, ...props }) => (
      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b" {...props} />
    ),
    tr: ({ node, ...props }) => (
      <tr className="hover:bg-gray-50" {...props} />
    ),
    td: ({ node, ...props }) => (
      <td className="px-4 py-3 text-sm text-gray-500 border-b" {...props} />
    ),
  };

  return (
    <>
      {/* Progress bar */}
      <div 
        className="fixed top-0 left-0 h-1 bg-blue-600 z-50 transition-all duration-300 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />
      
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </>
  )
} 