import { useEffect, useState } from 'react'
import { api } from './api.js'

async function readPage(scope, signal) {
  const { events } = await api('events.php', { signal })
  let signedIn = false
  let bookings = []
  let booking = null

  if (scope.startsWith('/staff')) {
    const session = await api('staff.php', { signal })
    signedIn = session.signedIn
    if (signedIn) {
      const list = await api('bookings.php', { signal })
      bookings = list.bookings
    }
  } else if (scope.startsWith('booking/')) {
    const reference = scope.slice('booking/'.length)
    try {
      const result = await api('bookings.php?reference=' + encodeURIComponent(reference), { signal })
      booking = result.booking
    } catch (error) {
      if (error.status !== 404) throw error
    }
  }
  return { events, bookings, booking, signedIn }
}

export default function usePageData(scope) {
  const [snapshot, setSnapshot] = useState(null)
  const [failure, setFailure] = useState(null)
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    let loading = false
    async function load() {
      if (loading) return
      loading = true
      try {
        const data = await readPage(scope, controller.signal)
        if (!controller.signal.aborted) {
          setSnapshot({ scope, data })
          setFailure(null)
        }
      } catch (error) {
        if (!controller.signal.aborted) setFailure({ scope, message: error.message })
      } finally {
        loading = false
      }
    }
    load()
    const refreshVisible = () => { if (!document.hidden) load() }
    window.addEventListener('focus', refreshVisible)
    const timer = window.setInterval(refreshVisible, 15000)
    return () => {
      controller.abort()
      window.clearInterval(timer)
      window.removeEventListener('focus', refreshVisible)
    }
  }, [scope, revision])

  return {
    data: snapshot?.scope === scope ? snapshot.data : null,
    error: failure?.scope === scope ? failure.message : '',
    refresh: () => setRevision(value => value + 1),
    clear: () => { setSnapshot(null); setFailure(null) },
  }
}
