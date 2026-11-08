import { useSyncExternalStore } from 'react'

function subscribe(listener) {
  window.addEventListener('hashchange', listener)
  return () => window.removeEventListener('hashchange', listener)
}

function getLocation() {
  return window.location.hash.slice(1) || '/'
}

export function useLocation() {
  return useSyncExternalStore(subscribe, getLocation)
}

export function navigate(path) {
  window.location.hash = path
}
