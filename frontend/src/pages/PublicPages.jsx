import EventBanner from '../components/EventBanner.jsx'
import EventCard, { EventMetadata } from '../components/EventCard.jsx'
import Icon from '../components/Icon.jsx'
import { Button, EmptyState, PageHeading } from '../components/ui.jsx'
import { eventPath } from '../data/demo.js'

function EventGrid({ events }) {
  if (!events.length) return <EmptyState title="No events to show">Upcoming events will appear here.</EmptyState>

  return (
    <div className="event-grid">
      {events.map(event => <EventCard key={event.id} event={event} />)}
    </div>
  )
}

export function HomePage({ events }) {
  return (
    <div className="home-page">
      <EventBanner home />
      <section className="events-section" aria-labelledby="upcoming-title">
        <div className="section-heading">
          <h2 id="upcoming-title">Upcoming Events</h2>
          <a className="text-link" href="#/events">See All</a>
        </div>
        <EventGrid events={events.slice(0, 3)} />
      </section>
    </div>
  )
}

export function EventsPage({ events }) {
  return (
    <>
      <PageHeading title="Upcoming Events" description="Choose a screening to see the details and book a place." />
      <EventGrid events={events} />
    </>
  )
}

export function EventPage({ event, referral }) {
  const full = event.remaining === 0
  const registration = eventPath(event) + '/register' + (referral ? '?ref=' + encodeURIComponent(referral) : '')

  return (
    <div className="event-page">
      <EventBanner />
      <div className="event-page-layout">
        <section className="event-overview" aria-labelledby="event-title">
          <h1 id="event-title">{event.title}</h1>
          <div className="event-overview-details">
            <EventMetadata event={event} includeCapacity />
            <div className={'capacity-pill' + (full ? ' capacity-pill--waiting' : '')}>
              <strong>{full ? event.waitlist : event.remaining}</strong>
              <span>{full ? 'Waiting list' : 'places left'}</span>
            </div>
          </div>
        </section>
        <section className="panel event-about">
          <h2>About the event</h2>
          <p>{event.description}</p>
          <p className="muted">Open to eligible B40 women. Please review the eligibility checklist when registering.</p>
          <Button to={registration} className="full-button">
            {full ? 'Join Waiting List' : 'Register Now'}
          </Button>
        </section>
      </div>
    </div>
  )
}

export function AboutPage() {
  return (
    <div className="about-page">
      <PageHeading title="About us" />
      <div className="about-layout">
        <div className="about-art" aria-hidden="true">
          <Icon name="banner-image" />
          <Icon name="banner-image" />
        </div>
        <div className="about-copy">
          <section className="panel">
            <h2>ROSE Foundation</h2>
            <p>ROSE Foundation supports community screening events and helps eligible women access a screening near them.</p>
            <p>Use this prototype to explore events, try a booking, or preview the staff tools.</p>
          </section>
          <section>
            <h2 className="contact-title">Contact us</h2>
            <ul className="panel contact-list">
              <li><Icon name="phone" /><span>Phone details to be added</span></li>
              <li><Icon name="email" /><span>Email details to be added</span></li>
              <li><Icon name="website" /><span>Website details to be added</span></li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
