import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { Button, EmptyState, Field, PageHeading } from '../components/ui.jsx'
import { eventDate, eventPath, eventTime, referralSources } from '../data/demo.js'
import { navigate } from '../navigation.js'

const referralOptions = referralSources.map(source => ({ value: source.id, label: source.name }))
const ageOptions = [
  { value: '', label: 'Select your age range' },
  { value: '18-29', label: '18-29' },
  { value: '30-39', label: '30-39' },
  { value: '40-49', label: '40-49' },
  { value: '50+', label: '50 or above' },
  { value: 'prefer-not', label: 'Prefer not to say' },
]
const incomeOptions = [
  { value: '', label: 'Select your range' },
  { value: 'below-2500', label: 'Below RM 2,500' },
  { value: '2500-3999', label: 'RM 2,500 - RM 3,999' },
  { value: '4000-plus', label: 'RM 4,000 or above' },
]

function BookingSteps({ current }) {
  return (
    <ol className="booking-steps" aria-label="Registration progress">
      {['Personal Details', 'Eligibility', 'Confirmation'].map((label, index) => (
        <li key={label} aria-current={index + 1 === current ? 'step' : undefined}>
          <span className="step-number">{index + 1}</span>
          <span>{label}</span>
        </li>
      ))}
    </ol>
  )
}

export function BookingFlow({ event, step, referral, onBook }) {
  const [draft, setDraft] = useState(null)
  const eligibility = step === 'eligibility' && draft !== null
  const startingReferral = referralSources.some(source => source.id === referral) ? referral : 'general'
  const bookingPath = eventPath(event) + '/register'
  const referralQuery = referral ? '?ref=' + encodeURIComponent(referral) : ''

  function continueToEligibility(submission) {
    submission.preventDefault()
    const fields = new FormData(submission.currentTarget)
    setDraft({
      name: fields.get('name').trim(),
      phone: fields.get('phone').trim(),
      referral: fields.get('referral'),
      age: fields.get('age'),
    })
    navigate(bookingPath + '/eligibility' + referralQuery)
  }

  return (
    <section className="registration-page narrow-page">
      <PageHeading
        title={event.remaining ? 'Register for an event' : 'Join the waiting list'}
        description={event.title}
      />
      <BookingSteps current={eligibility ? 2 : 1} />
      {eligibility ? (
        <form key="eligibility" className="form-stack" onSubmit={submission => {
          submission.preventDefault()
          // TODO(api): Validate eligibility on the server when submitting a real booking.
          onBook(event, draft)
        }}>
          <div className="form-intro">
            <h2>B40 Eligibility Confirmation</h2>
            <p>Please confirm that you meet the following criteria.</p>
          </div>
          <Field label="Monthly Household Income" name="income" defaultValue="" options={incomeOptions} required />
          <fieldset className="eligibility-checklist">
            <legend className="sr-only">Eligibility checklist</legend>
            <label><input type="checkbox" required /> <span>I am a Malaysian citizen or permanent resident.</span></label>
            <label><input type="checkbox" required /> <span>My household income is within the B40 category.</span></label>
            <label><input type="checkbox" required /> <span>I understand this service is for eligible women only.</span></label>
          </fieldset>
          <div className="form-actions">
            <Button to={bookingPath + referralQuery} variant="outline">Back</Button>
            <Button type="submit">Continue</Button>
          </div>
        </form>
      ) : (
        <form key="details" className="form-stack" onSubmit={continueToEligibility}>
          <Field label="Full Name" name="name" autoComplete="name" placeholder="Enter your full name" defaultValue={draft?.name} pattern=".*\S.*" required />
          <Field label="Phone number" name="phone" type="tel" autoComplete="tel" placeholder="Enter your phone number" defaultValue={draft?.phone} pattern=".*[0-9].*" required />
          <Field label="Age (optional)" name="age" options={ageOptions} defaultValue={draft?.age ?? ''} />
          <Field label="Reference" name="referral" options={referralOptions} defaultValue={draft?.referral ?? startingReferral} />
          <p className="field-hint">Prototype form. Use sample details for this booking.</p>
          <div className="form-actions"><Button type="submit">Continue</Button></div>
        </form>
      )}
    </section>
  )
}

export function MyBookingsPage({ bookings }) {
  const [error, setError] = useState('')

  function findBooking(submission) {
    submission.preventDefault()
    const fields = new FormData(submission.currentTarget)
    const reference = fields.get('reference').trim().toUpperCase()
    const name = fields.get('name').trim().toLowerCase()

    // TODO(api): Look up the booking by its reference and participant details.
    const booking = bookings.find(item => item.reference === reference && item.name.toLowerCase() === name)
    if (booking) navigate('/bookings/' + booking.reference)
    else setError('We couldn’t find a booking with that reference and name.')
  }

  return (
    <section className="narrow-page">
      <PageHeading title="My Bookings" description="Enter your booking details to view or cancel your place." />
      <form className="form-stack" onSubmit={findBooking} onInput={() => setError('')}>
        <Field label="Booking Reference Number" name="reference" placeholder="Enter your booking reference" autoCapitalize="characters" required />
        <Field label="Name" name="name" autoComplete="name" placeholder="Enter your full name" required />
        <p className="demo-note"><strong>Try a sample booking</strong><br />ROSE-REF12345 · Demo Participant</p>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="form-actions"><Button type="submit">Continue</Button></div>
      </form>
    </section>
  )
}

function BookingSummary({ event, reference }) {
  return (
    <dl className="panel booking-summary">
      <div><dt>Event</dt><dd>{event.title}</dd></div>
      <div><dt>Date</dt><dd>{eventDate(event)}</dd></div>
      <div><dt>Time</dt><dd>{eventTime(event)}</dd></div>
      <div><dt>Location</dt><dd>{event.location}</dd></div>
      <div><dt>Booking Ref</dt><dd>{reference}</dd></div>
    </dl>
  )
}

function addToCalendar(event, reference) {
  const calendarValue = value => value.replaceAll('\\', '\\\\').replaceAll('\n', '\\n').replaceAll(',', '\\,').replaceAll(';', '\\;')
  const calendarDateTime = date => date.toISOString().replace(/[-:]|\.\d{3}/g, '')
  // Event times in the prototype are Malaysian local times.
  const eventTimeUtc = time => calendarDateTime(new Date(event.date + 'T' + time + ':00+08:00'))
  const calendar = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ROSE Foundation//Event Booking Prototype//EN',
    'BEGIN:VEVENT', 'UID:' + reference + '@rose.example', 'DTSTAMP:' + calendarDateTime(new Date()),
    'DTSTART:' + eventTimeUtc(event.startTime), 'DTEND:' + eventTimeUtc(event.endTime),
    'SUMMARY:' + calendarValue(event.title), 'LOCATION:' + calendarValue(event.location),
    'END:VEVENT', 'END:VCALENDAR', '',
  ]
  const url = URL.createObjectURL(new Blob([calendar.join('\r\n')], { type: 'text/calendar;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'rose-event.ics'
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function BookingResult({ booking, event, onCancel }) {
  const [confirmCancel, setConfirmCancel] = useState(false)

  if (!booking || !event) {
    return (
      <div className="narrow-page">
        <EmptyState title="Booking not found" to="/bookings" action="Find a booking">
          Bookings made during this demo are available until the page is refreshed.
        </EmptyState>
      </div>
    )
  }

  const waiting = booking.status === 'waiting'
  const cancelled = booking.status === 'cancelled'
  const title = waiting ? 'You’re on the Waiting List' : cancelled ? 'Booking Successfully Cancelled' : 'Booking Confirmed!'
  const description = waiting
    ? 'This event is currently full. Your request has been added to the demo waiting list.'
    : cancelled ? 'Your place has been cancelled.' : 'Your place has been reserved in this demo.'

  return (
    <section className="status-page narrow-page">
      <div className={'status-icon status-icon--' + booking.status} aria-hidden="true">
        <Icon name={waiting ? 'hourglass' : booking.status} />
      </div>
      <div className="status-heading">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {waiting ? (
        <div className="panel queue-card">
          <h2>Your Position</h2>
          <strong>{booking.position}</strong>
          <p>Booking Ref <b>{booking.reference}</b></p>
        </div>
      ) : (
        <BookingSummary event={event} reference={booking.reference} />
      )}

      {cancelled || waiting ? (
        <div className="status-actions"><Button to="/" variant="outline">Back to home</Button></div>
      ) : confirmCancel ? (
        <div className="status-actions cancel-panel">
          <p>Cancel your place at this event?</p>
          <Button variant="outline" onClick={() => setConfirmCancel(false)}>Keep my booking</Button>
          <Button onClick={() => { onCancel(booking.reference); setConfirmCancel(false) }}>Confirm Cancellation</Button>
        </div>
      ) : (
        <div className="status-actions">
          <Button variant="outline" onClick={() => addToCalendar(event, booking.reference)}>Add to Calendar</Button>
          <Button onClick={() => setConfirmCancel(true)}>Cancel My Booking</Button>
        </div>
      )}
    </section>
  )
}
