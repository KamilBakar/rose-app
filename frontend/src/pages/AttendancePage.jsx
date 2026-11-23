import { useState } from 'react'
import { Button, EmptyState, Field, PageHeading } from '../components/ui.jsx'

export default function AttendancePage({ events, bookings, initialEvent, onCheckIn, onWalkIn, busy }) {
  const [eventId, setEventId] = useState(initialEvent)
  const [query, setQuery] = useState('')
  const [walkInId, setWalkInId] = useState(null)
  const showWalkIn = Boolean(walkInId)
  const event = events.find(item => item.id === eventId) ?? events[0]
  const search = query.trim().toLowerCase()
  const attendees = bookings.filter(booking => booking.eventId === event?.id
    && booking.status === 'confirmed'
    && (booking.name.toLowerCase().includes(search) || booking.phone.includes(search)))

  return (
    <section>
      <PageHeading title="Event Attendance" description="Find a booking and mark the participant as checked in." eyebrow="Staff check-in">
        <Button variant="outline" disabled={!event?.remaining} aria-expanded={showWalkIn} onClick={() => setWalkInId(showWalkIn ? null : crypto.randomUUID())}>
          {showWalkIn ? 'Close Walk-in Form' : 'Add Walk-in'}
        </Button>
      </PageHeading>
      <div className="filter-grid">
        <Field label="Select event" value={event?.id ?? ''} onChange={change => {
          setEventId(change.target.value)
          setWalkInId(null)
        }} options={events.map(item => ({ value: item.id, label: item.title }))} />
        <Field label="Search attendees" type="search" placeholder="Search name or phone number..." icon="person-muted" value={query} onChange={change => setQuery(change.target.value)} />
      </div>

      {showWalkIn && event?.remaining > 0 && (
        <form className="panel form-stack walk-in-form" onSubmit={async submission => {
          submission.preventDefault()
          const data = new FormData(submission.currentTarget)
          const saved = await onWalkIn(event, {
            name: data.get('name').trim(), phone: data.get('phone').trim(), requestId: walkInId,
          })
          if (saved) setWalkInId(null)
        }}>
          <h2>Add eligible walk-in</h2>
          <Field label="Full Name" name="name" pattern=".*\S.*" required />
          <Field label="Phone number" name="phone" type="tel" pattern=".*[0-9].*" required />
          <Button type="submit" disabled={busy}>Add and Check In</Button>
        </form>
      )}

      <section className="attendance-list-section" aria-labelledby="attendees-title">
        <div className="section-heading"><h2 id="attendees-title">Attendees</h2></div>
        {attendees.length ? (
          <ul className="attendance-list">
            {attendees.map(attendee => (
              <li key={attendee.reference} className="attendance-row">
                <div><strong>{attendee.name}</strong><small>{attendee.phone}</small></div>
                {attendee.attended ? (
                  <span className="chip chip--success">Checked in</span>
                ) : (
                  <Button className="button--small" disabled={busy} onClick={() => onCheckIn(attendee.reference)} aria-label={'Check in ' + attendee.name}>Check-in</Button>
                )}
              </li>
            ))}
          </ul>
        ) : <EmptyState title="No matching attendees">Try another search or select a different event.</EmptyState>}
      </section>
    </section>
  )
}
