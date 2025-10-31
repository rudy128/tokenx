"use client"

import React from 'react'

interface MainLayoutWrapperProps {
  children: React.ReactNode
}

/**
 * MainLayoutWrapper - Wraps layouts
 */
export function MainLayoutWrapper({ children }: MainLayoutWrapperProps) {
  return (
    <>
      {children}
    </>
  )
}
