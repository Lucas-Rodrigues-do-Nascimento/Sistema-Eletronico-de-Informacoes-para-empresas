// src/components/ui/breadcrumb.tsx
import * as React from 'react'
import Link from 'next/link'

interface BreadcrumbProps {
  children: React.ReactNode
}

export function Breadcrumb({ children }: BreadcrumbProps) {
  return (
    <nav className="text-sm text-gray-600 mb-4" aria-label="Breadcrumb">
      <ol className="list-reset flex items-center gap-2">{children}</ol>
    </nav>
  )
}

interface BreadcrumbItemProps {
  children: React.ReactNode
  isCurrentPage?: boolean
}

export function BreadcrumbItem({ children, isCurrentPage }: BreadcrumbItemProps) {
  return (
    <li className="flex items-center gap-2">
      {!isCurrentPage && <span className="text-gray-400">/</span>}
      <span className={isCurrentPage ? 'font-semibold text-gray-800' : ''}>
        {children}
      </span>
    </li>
  )
}

interface BreadcrumbLinkProps {
  href: string
  children: React.ReactNode
}

export function BreadcrumbLink({ href, children }: BreadcrumbLinkProps) {
  return (
    <Link href={href} className="hover:underline">
      {children}
    </Link>
  )
}
