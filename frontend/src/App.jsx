import { useState } from 'react'
import AppShell from './components/AppShell.jsx'
import { EmptyState } from './components/ui.jsx'
import { demoBookings, demoEvents, eventPath, withEventCounts } from './data/demo.js'
import { navigate, useLocation } from './navigation.js'
import { BookingFlow, BookingResult } from './pages/BookingPages.jsx'
import { AboutPage, EventPage, EventsPage, HomePage } from './pages/PublicPages.jsx'
import './App.css'

export default function App() {
  const [bookings, setBookings] = useState(demoBookings)
  const [path, search] = useLocation().split('?')
  const [, section, id, action, step] = path.split('/')
  const referral = new URLSearchParams(search).get('ref')

  const events = demoEvents.map(event => withEventCounts(event, bookings))
  const event = events.find(item => item.id === id)

  function createBooking(event, draft) {
    const suffix = crypto.randomUUID().slice(0, 8).toUpperCase()
    const reference = 'ROSE-DEMO-' + suffix

    // TODO(api): Submit the booking and use the status and reference returned by PHP.
    setBookings(current => {
      const { remaining, waitlist } = withEventCounts(event, current)
      const waiting = remaining === 0
      const booking = {
        reference,
        eventId: event.id,
        name: draft.name,
        phone: draft.phone,
        referral: draft.referral,
        status: waiting ? 'waiting' : 'confirmed',
        position: waiting ? waitlist + 1 : undefined,
        attended: false,
      }

      return [...current, booking]
    })

    navigate('/bookings/' + reference)
  }

  let page
  let backTo = section === 'events' && id ? '/events' : undefined

  switch (section) {
    case '':
      page = <HomePage events={events} />
      break

    case 'events':
      if (!id) {
        page = <EventsPage events={events} />
      } else if (!event) {
        page = <EmptyState title="Event not found" to="/events" action="Browse events" />
      } else if (action === 'register') {
        const previousPath = eventPath(event) + (step === 'eligibility' ? '/register' : '')
        backTo = search ? previousPath + '?' + search : previousPath
        page = (
          <BookingFlow
            key={event.id}
            event={event}
            step={step}
            referral={referral}
            onBook={createBooking}
          />
        )
      } else {
        page = <EventPage event={event} referral={referral} />
      }
      break

    case 'about':
      page = <AboutPage />
      break

    case 'bookings':
    case 'staff':
      if (section === 'bookings' && id) {
        const booking = bookings.find(item => item.reference === id.toUpperCase())
        const bookedEvent = events.find(item => item.id === booking?.eventId)
        page = <BookingResult booking={booking} event={bookedEvent} />
      } else {
        page = (
          <EmptyState title="Coming soon" to="/" action="Back to home">
            This section will be added later.
          </EmptyState>
        )
      }
      break

    case 'about':
      page = <AboutPage />
      break

    default:
      page = <EmptyState title="Page not found" to="/" action="Back to home" />
  }

  return <AppShell path={path} backTo={backTo}>{page}</AppShell>
}