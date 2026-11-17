import { useState } from 'react'
import AppShell, { StaffNav } from './components/AppShell.jsx'
import { EventForm, ForgotPasswordPage, StaffLogin } from './pages/StaffForms.jsx'
import { EmptyState } from './components/ui.jsx'
import { demoBookings, demoEvents, eventPath, withEventCounts } from './data/demo.js'
import { navigate, useLocation } from './navigation.js'
import { BookingFlow, BookingResult, MyBookingsPage } from './pages/BookingPages.jsx'
import { AboutPage, EventPage, EventsPage, HomePage } from './pages/PublicPages.jsx'
import { EventManagement, StaffDashboard } from './pages/StaffDashboard.jsx'
import AttendancePage from './pages/AttendancePage.jsx'
import ReportsPage from './pages/ReportsPage.jsx'
import './App.css'

export default function App() {
  const [bookings, setBookings] = useState(demoBookings)
  const [staffSignedIn, setStaffSignedIn] = useState(false)
  const [eventList, setEventList] = useState(demoEvents)
  const [path, search] = useLocation().split('?')
  const [, section, id, action, step] = path.split('/')
  const params = new URLSearchParams(search)
  const referral = params.get('ref')
  const eventFilter = params.get('event') ?? ''

  const events = eventList.map(event => withEventCounts(event, bookings))
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

  function saveEvent(fields, eventId) {
    const nextId = eventId ?? 'event-' + crypto.randomUUID()

    // TODO(api): Save the event through PHP and use the ID returned by the API.
    setEventList(current =>
      eventId
        ? current.map(event => event.id === eventId ? { ...event, ...fields } : event)
        : [...current, { ...fields, id: nextId, referralCounts: {}, waiting: 0 }]
    )

    navigate('/staff/events/' + nextId)
  }

  function checkInBooking(reference) {
  // TODO(api): Save attendance through the PHP API.
  setBookings(current =>
    current.map(booking =>
      booking.reference === reference && booking.status === 'confirmed'
        ? { ...booking, attended: true }
        : booking
    )
  )
}

function addWalkIn(event, name, phone) {
  const reference = 'ROSE-DEMO-' + crypto.randomUUID().slice(0, 8).toUpperCase()

  // TODO(api): Create a checked-in booking and enforce capacity in PHP.
    setBookings(current => {
      const liveEvent = withEventCounts(event, current)
      if (liveEvent.remaining === 0) return current

      const booking = {
        reference,
        eventId: event.id,
        name,
        phone,
        referral: 'general',
        status: 'confirmed',
        attended: true,
      }

      return [...current, booking]
    })
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
        } else if (id === 'attendance') {
          backTo = '/staff'
          staffPage = (
            <AttendancePage
              key={eventFilter}
              events={events}
              bookings={bookings}
              initialEvent={eventFilter}
              onCheckIn={checkInBooking}
              onWalkIn={addWalkIn}
            />
          )
        } else if (id === 'reports') {
            backTo = '/staff'
            staffPage = (
              <ReportsPage
                key={eventFilter}
                events={events}
                initialEvent={eventFilter}
              />
            )
          } else if (id === 'events') {
            
          const staffEvent = events.find(item => item.id === action)
          backTo = '/staff'

          if (action === 'new') {
            staffPage = <EventForm key="new" onSave={saveEvent} />
          } else if (!staffEvent) {
            staffPage = (
              <EmptyState title="Event not found" to="/staff" action="Back to Dashboard" />
            )
          } else if (step === 'edit') {
            backTo = '/staff/events/' + staffEvent.id
            staffPage = (
              <EventForm key={staffEvent.id} event={staffEvent} onSave={saveEvent} />
            )
          } else {
            staffPage = (
              <EventManagement key={staffEvent.id} event={staffEvent} bookings={bookings} />
            )
          }
        } else {
          staffPage = (
            <EmptyState title="Coming soon" to="/staff" action="Back to Dashboard">
              Not added yet..
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

    default:
      page = <EmptyState title="Page not found" to="/" action="Back to home" />
  }

  return <AppShell path={path} backTo={backTo}>{page}</AppShell>
}