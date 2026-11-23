import { useRef, useState } from 'react'
import AppShell, { StaffNav } from './components/AppShell.jsx'
import { EventForm, ForgotPasswordPage, StaffLogin } from './pages/StaffForms.jsx'
import { Button, EmptyState } from './components/ui.jsx'
import { eventPath } from './data/events.js'
import { api, post } from './api.js'
import usePageData from './usePageData.js'
import { navigate, useLocation } from './navigation.js'
import { BookingFlow, BookingResult, MyBookingsPage } from './pages/BookingPages.jsx'
import { AboutPage, EventPage, EventsPage, HomePage } from './pages/PublicPages.jsx'
import { EventManagement, StaffDashboard } from './pages/StaffDashboard.jsx'
import AttendancePage from './pages/AttendancePage.jsx'
import ReportsPage from './pages/ReportsPage.jsx'
import './App.css'

export default function App() {
  const [path, search] = useLocation().split('?')
  const [, section, id, action, step] = path.split('/')
  const params = new URLSearchParams(search)
  const referral = params.get('ref')
  const eventFilter = params.get('event') ?? ''

  let scope = 'public'
  if (section === 'staff') scope = path
  if (section === 'bookings' && id) scope = 'booking/' + id
  const { data, error, refresh, clear } = usePageData(scope)
  const [busy, setBusy] = useState(false)
  const [failure, setFailure] = useState(null)
  const pending = useRef(false)

  const events = data?.events ?? []
  const bookings = data?.bookings ?? []
  const event = events.find(item => item.id === id)

  async function run(work) {
    if (pending.current) return false
    pending.current = true
    setBusy(true)
    setFailure(null)
    try {
      await work()
      refresh()
      return true
    } catch (error) {
      setFailure({ path, message: error.message })
      return false
    } finally {
      pending.current = false
      setBusy(false)
    }
  }

  function createBooking(event, draft) {
    return run(async () => {
      const { reference } = await post('bookings.php', { ...draft, eventId: event.id })
      navigate('/bookings/' + reference)
    })
  }

  function lookupBooking(fields) {
    return run(async () => {
      const { reference } = await post('bookings.php', { ...fields, action: 'lookup' })
      navigate('/bookings/' + reference)
    })
  }

  function cancelBooking(reference) {
    return run(() => post('bookings.php', { action: 'cancel', reference }))
  }

  function saveEvent(fields, eventId) {
    return run(async () => {
      const endpoint = 'events.php' + (eventId ? '?id=' + encodeURIComponent(eventId) : '')
      const { id } = await api(endpoint, { method: eventId ? 'PUT' : 'POST', data: fields })
      navigate('/staff/events/' + id)
    })
  }

  function checkInBooking(reference) {
    return run(() => post('bookings.php', { action: 'checkIn', reference }))
  }

  function addWalkIn(event, fields) {
    return run(() => post('bookings.php', { ...fields, action: 'walkIn', eventId: event.id }))
  }

  function login(fields) {
    return run(async () => {
      await post('staff.php', fields)
      clear()
      navigate('/staff')
    })
  }

  function logout() {
    return run(async () => {
      await post('staff.php', { action: 'logout' })
      clear()
      navigate('/staff/login')
    })
  }

  const feedback = (error || failure?.path === path) && (
    <div role="alert" className="panel form-error">
      {failure?.path === path && <p>{failure.message}</p>}
      {error && <p>{error} <Button variant="outline" onClick={refresh}>Retry</Button></p>}
    </div>
  )
  if (!data) {
    return <AppShell path={path}>{feedback || <p role="status">Loading…</p>}</AppShell>
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
            busy={busy}
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
        page = <MyBookingsPage onLookup={lookupBooking} busy={busy} />
        break
      }

      const booking = data.booking
      const bookedEvent = events.find(item => item.id === booking?.eventId)

      page = (
        <BookingResult
          key={id}
          booking={booking}
          event={bookedEvent}
          onCancel={cancelBooking}
          busy={busy}
        />
      )
      break
    }

    case 'staff':
      if (id === 'forgot-password') {
        page = <ForgotPasswordPage />
      } else if (!data.signedIn || id === 'login') {
        page = (
          <StaffLogin onSignIn={login} busy={busy} />
        )
      } else {
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
              busy={busy}
            />
          )
        } else if (id === 'reports') {
          backTo = '/staff'
          staffPage = (
            <ReportsPage key={eventFilter} events={events} initialEvent={eventFilter} />
          )
        } else if (id === 'events') {
          const staffEvent = events.find(item => item.id === action)
          backTo = '/staff'

          if (action === 'new') {
            staffPage = <EventForm key="new" onSave={saveEvent} busy={busy} />
          } else if (!staffEvent) {
            staffPage = (
              <EmptyState title="Event not found" to="/staff" action="Back to Dashboard" />
            )
          } else if (step === 'edit') {
            backTo = '/staff/events/' + staffEvent.id
            staffPage = (
              <EventForm key={staffEvent.id} event={staffEvent} onSave={saveEvent} busy={busy} />
            )
          } else {
            staffPage = (
              <EventManagement key={staffEvent.id} event={staffEvent} bookings={bookings} onCancel={cancelBooking} busy={busy} />
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
            <StaffNav path={path} onSignOut={logout} />
            {staffPage}
          </div>
        )
      }
      break

    default:
      page = <EmptyState title="Page not found" to="/" action="Back to home" />
  }

  return <AppShell path={path} backTo={backTo}>{feedback}{page}</AppShell>
}
