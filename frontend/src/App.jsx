import AppShell from './components/AppShell.jsx'
import { EmptyState } from './components/ui.jsx'
import {
  demoBookings,
  demoEvents,
  withEventCounts,
} from './data/demo.js'
import { useLocation } from './navigation.js'
import {
  AboutPage,
  EventPage,
  EventsPage,
  HomePage,
} from './pages/PublicPages.jsx'
import './App.css'

function App() {
  // Read the current address, such as /events or /events/event-id.
  const location = useLocation()
  const [path, search] = location.split('?')
  const [, section, eventId, action] = path.split('/')
  const referral = new URLSearchParams(search).get('ref')

  // Prepare the sample events with their booking totals.
  const events = demoEvents.map(event =>
    withEventCounts(event, demoBookings)
  )

  const event = events.find(item => item.id === eventId)

  let page

  switch (section) {
    case '':
      page = <HomePage events={events} />
      break

    case 'events':
      if (!eventId) {
        page = <EventsPage events={events} />
      } else if (!event) {
        page = (
          <EmptyState
            title="Event not found"
            to="/events"
            action="Browse events"
          />
        )
      } else if (action === 'register') {
        // TODO: Connect the booking screens in the next step.
        page = (
          <EmptyState
            title="Registration coming soon"
            to={'/events/' + event.id}
            action="Back to event"
          >
            The booking form will be added next.
          </EmptyState>
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
      // TODO: Connect booking lookup and staff screens later.
      page = (
        <EmptyState
          title="Coming soon"
          to="/"
          action="Back to home"
        >
          This section will be added in a later update.
        </EmptyState>
      )
      break

    default:
      page = (
        <EmptyState
          title="Page not found"
          to="/"
          action="Back to home"
        />
      )
  }

  return (
    <AppShell
      path={path}
      backTo={section === 'events' && eventId ? '/events' : undefined}
    >
      {page}
    </AppShell>
  )
}

export default App