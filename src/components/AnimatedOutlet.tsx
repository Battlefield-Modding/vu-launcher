import React from 'react'
import { useLocation, useOutlet } from 'react-router'
import { AnimatePresence } from 'framer-motion'

export function AnimatedOutlet(): React.JSX.Element {
  const location = useLocation()
  const element = useOutlet()

  return (
    <AnimatePresence mode="wait">
      {element && React.cloneElement(element, { key: location.pathname })}
    </AnimatePresence>
  )
}
