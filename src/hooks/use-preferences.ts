'use client'

import { useSyncExternalStore } from 'react'

/**
 * Motion & pointer preferences as external stores, so components stay in sync with
 * the OS setting *and* the site's own Calm mode (html[data-calm="true"]).
 * Server snapshots are the conservative choice: no motion, no fine pointer.
 */

const REDUCED = '(prefers-reduced-motion: reduce)'
const FINE = '(hover: hover) and (pointer: fine)'

function subscribeMotion(onChange: () => void) {
  const media = window.matchMedia(REDUCED)
  media.addEventListener('change', onChange)
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-calm'] })
  return () => {
    media.removeEventListener('change', onChange)
    observer.disconnect()
  }
}

function reducedMotionSnapshot() {
  return window.matchMedia(REDUCED).matches || document.documentElement.dataset.calm === 'true'
}

/** True when the OS asks for reduced motion or the reader switched on Calm mode. */
export function useReducedMotionPreference() {
  return useSyncExternalStore(subscribeMotion, reducedMotionSnapshot, () => true)
}

export function useMediaQuery(query: string, serverValue = false) {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query)
      media.addEventListener('change', onChange)
      return () => media.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  )
}

export function useFinePointer() {
  return useMediaQuery(FINE, false)
}

type NetworkInformation = EventTarget & { saveData?: boolean }
const networkInfo = () => (navigator as Navigator & { connection?: NetworkInformation }).connection

/** True when the browser's data saver is on (Network Information API, where supported). */
export function useSaveData() {
  return useSyncExternalStore(
    (onChange) => {
      const connection = networkInfo()
      connection?.addEventListener('change', onChange)
      return () => connection?.removeEventListener('change', onChange)
    },
    () => Boolean(networkInfo()?.saveData),
    () => false,
  )
}

/** Non-hook check for imperative code (event handlers, effects). */
export function prefersReducedMotion() {
  if (typeof window === 'undefined') return true
  return reducedMotionSnapshot()
}
