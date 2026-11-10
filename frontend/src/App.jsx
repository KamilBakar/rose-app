import { useState } from 'react'
import AppShell, { StaffNav } from './components/AppShell.jsx'
import { ForgotPasswordPage, StaffLogin } from './pages/StaffForms.jsx'
import { EmptyState } from './components/ui.jsx'
import { demoBookings, demoEvents, eventPath, withEventCounts } from './data/demo.js'
import { navigate, useLocation } from './navigation.js'
import { BookingFlow, BookingResult, MyBookingsPage } from './pages/BookingPages.jsx'
import { AboutPage, EventPage, EventsPage, HomePage } from './pages/PublicPages.jsx'
import { EventManagement, StaffDashboard } from './pages/StaffDashboard.jsx'
import './App.css'

export default function App() {
  const [bookings, setBookings] = useState(demoBookings)
  const [staffSignedIn, setStaffSignedIn] = useState(false)
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

  function cancelBooking(reference) {
  // TODO(api): Save the cancellation through the PHP API.
  setBookings(current =>
    current.map(booking =>
      booking.reference === reference
        ? { ...booking, status: 'cancelled', attended: false }
        : booking
    )
  )
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

    case 'bookings': {
      if (!id) {
        page = <MyBookingsPage bookings={bookings} />
        break
      }

      const booking = bookings.find(item => item.reference === id.toUpperCase())
      const bookedEvent = events.find(item => item.id === booking?.eventId)

      page = (
        <BookingResult
          key={id}
          booking={booking}
          event={bookedEvent}
          onCancel={cancelBooking}
        />
      )
      break
    }

    case 'staff':
      if (id === 'forgot-password') {
        page = <ForgotPasswordPage />
      } else if (!staffSignedIn || id === 'login') {
        page = (
          <StaffLogin onSignIn={() => {
            setStaffSignedIn(true)
            navigate('/staff')
          }} />
        )
      } 
      else {
        let staffPage

        if (!id) {
          staffPage = <StaffDashboard events={events} />
        } else if (id === 'events' && action && action !== 'new' && !step) {
          const staffEvent = events.find(item => item.id === action)
          backTo = '/staff'

          staffPage = staffEvent ? (
            <EventManagement key={staffEvent.id} event={staffEvent} bookings={bookings} />
          ) : (
            <EmptyState title="Event not found" to="/staff" action="Back to Dashboard" />
          )
        } else {
          staffPage = (
            <EmptyState title="Not added yet" to="/staff" action="Back to Dashboard">
              Will add later
            </EmptyState>
          )
        }

        page = (
          <div className="staff-area">
            <StaffNav path={path} onSignOut={() => {
              setStaffSignedIn(false)
              navigate('/staff/login')
            }} />
            {staffPage}
          </div>
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