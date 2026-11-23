import { useState } from 'react'
import { EventThumbnail } from '../components/EventCard.jsx'
import { Button, PageHeading } from '../components/ui.jsx'
import { eventDate, eventPath, referralSources } from '../data/events.js'

function StaffEventCard({ event }) {
  return (
    <article className="staff-event-card">
      <a className="staff-event-summary" href={'#/staff/events/' + event.id}>
        <EventThumbnail />
        <div className="staff-event-body">
          <h3>{event.title}</h3>
          <div className="staff-event-meta">
            <time dateTime={event.date}>{eventDate(event)}</time>
            <span>{event.booked}/{event.capacity}</span>
          </div>
          <progress value={event.booked} max={event.capacity} aria-label={'Bookings for ' + event.title} />
        </div>
      </a>
      <div className="staff-event-actions">
        <a className="text-link" href={'#/staff/events/' + event.id}>Manage event</a>
        <a className="text-link" href={'#/staff/attendance?event=' + event.id}>Check-in</a>
      </div>
    </article>
  )
}

export function StaffDashboard({ events }) {
  const totals = [
    { label: 'Total Events', value: events.length },
    { label: 'Total Bookings', value: events.reduce((total, event) => total + event.booked, 0) },
    { label: 'Available Spaces', value: events.reduce((total, event) => total + event.remaining, 0) },
    { label: 'Waiting list', value: events.reduce((total, event) => total + event.waitlist, 0) },
  ]

  return (
    <section className="staff-dashboard">
      <PageHeading title="Welcome back!" description="Here's an overview of your events and bookings." eyebrow="Staff dashboard">
        <Button to="/staff/events/new">Create an Event</Button>
      </PageHeading>
      <dl className="stats-grid">
        {totals.map(stat => (
          <div className="stat-card" key={stat.label}>
            <dt>{stat.label}</dt>
            <dd>{stat.value}</dd>
          </div>
        ))}
      </dl>
      <section className="staff-events-section">
        <div className="section-heading"><h2>Upcoming Events</h2></div>
        <div className="staff-events-grid">
          {events.map(event => <StaffEventCard key={event.id} event={event} />)}
        </div>
      </section>
    </section>
  )
}

export function EventManagement({ event, bookings, onCancel, busy }) {
  const [notice, setNotice] = useState('')
  const [confirmRef, setConfirmRef] = useState(null)
  const eventBookings = bookings.filter(booking => booking.eventId === event.id)

  return (
    <>
      <PageHeading title={event.title} description={event.booked + ' bookings · ' + event.remaining + ' places left · ' + event.waitlist + ' waiting'} eyebrow="Manage event">
        <Button to={'/staff/events/' + event.id + '/edit'}>Edit Event</Button>
      </PageHeading>
      <div className="staff-actions">
        <Button to={'/staff/attendance?event=' + event.id} variant="outline">Attendance</Button>
        <Button to={'/staff/reports?event=' + event.id} variant="outline">Referral Report</Button>
        <Button variant="outline" onClick={() => {
          setNotice('Demo notification recorded.')
        }}>Notify customers</Button>
      </div>
      {notice && <p className="demo-note" role="status">{notice}</p>}

      <div className="management-grid">
        <section className="panel">
          <h2>Share the event</h2>
          <p className="muted">Open the general link or a community leader's referral link.</p>
          <ul className="share-links">
            {referralSources.map(source => (
              <li key={source.id}>
                <a className="text-link" href={'#' + eventPath(event) + '?ref=' + source.id}>{source.name}</a>
                <span className="chip">QR placeholder</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="panel">
          <h2>Bookings</h2>
          {eventBookings.length ? (
            <ul className="sample-bookings">
              {eventBookings.map(booking => (
                <li key={booking.reference}>
                  <div><strong>{booking.name}</strong><small>{booking.reference}</small></div>
                  <span className="chip">{booking.status}</span>
                  {booking.status !== 'cancelled' && (confirmRef === booking.reference ? (
                    <div>
                      <Button variant="outline" onClick={() => setConfirmRef(null)}>Keep</Button>
                      <Button disabled={busy} onClick={async () => {
                        if (await onCancel(booking.reference)) setConfirmRef(null)
                      }}>Confirm cancellation</Button>
                    </div>
                  ) : <Button variant="outline" onClick={() => setConfirmRef(booking.reference)}>Cancel</Button>)}
                </li>
              ))}
            </ul>
          ) : <p className="muted">No bookings for this event yet.</p>}
        </section>
      </div>
      <div className="staff-actions"><Button to="/staff" variant="outline">Back to Dashboard</Button></div>
    </>
  )
}

