import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { Button, Field, PageHeading } from '../components/ui.jsx'

export function StaffLogin({ onSignIn }) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <section className="auth-page narrow-page">
      <div className="status-icon status-icon--waiting"><Icon name="lock" /></div>
      <PageHeading title="Staff Login" description="Sign in to access event management features." />
      <form className="form-stack" onSubmit={submission => {
        submission.preventDefault()
        // TODO(api): Replace demo access with the staff authentication endpoint.
        onSignIn()
      }}>
        <Field label="Email address" name="email" type="email" placeholder="Email address" icon="person-muted" autoComplete="off" hideLabel required />
        <Field
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter your password"
          icon="person-muted"
          autoComplete="off"
          hideLabel
          required
          end={<button type="button" className="field-end icon-button" aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword(value => !value)}>
            {showPassword ? 'Hide' : <Icon name="eye-off" />}
          </button>}
        />
        <p className="demo-note">Use the demo button to open the staff area, or enter the sample credentials which is staff@example.com and the password is demo123.</p>
        <div className="auth-actions">
          <Button type="submit">Sign In</Button>
          <Button variant="outline" onClick={onSignIn}>Use Demo Access</Button>
          <a href="#/staff/forgot-password" className="text-link">Forgot password?</a>
        </div>
      </form>
    </section>
  )
}

export function ForgotPasswordPage() {
  return (
    <section className="auth-page narrow-page">
      <div className="status-icon status-icon--waiting"><Icon name="contact-person" /></div>
      <PageHeading title="Please contact company staff" description="Ask your ROSE team administrator for help accessing your account." />
      {/* TODO(api): Add a staff password reset flow when authentication is connected. */}
      <Button to="/staff/login" variant="outline">Back to Staff Login</Button>
    </section>
  )
}

export function EventForm({ event, onSave }) {
  const [error, setError] = useState('')

  function save(submission) {
    submission.preventDefault()
    const fields = new FormData(submission.currentTarget)
    const startTime = fields.get('startTime')
    const endTime = fields.get('endTime')

    if (endTime <= startTime) {
      setError('Choose an end time after the start time.')
      return
    }

    onSave({
      title: fields.get('title').trim(),
      description: fields.get('description').trim(),
      location: fields.get('location').trim(),
      date: fields.get('date'),
      startTime,
      endTime,
      capacity: Number(fields.get('capacity')),
    }, event?.id)
  }

  return (
    <section className="narrow-page">
      <PageHeading title={event ? 'Edit an Event' : 'Create an Event'} />
      <form className="form-stack" onSubmit={save} onInput={() => setError('')}>
        <Field label="Event Title" name="title" placeholder="e.g. Women’s Health Screening" defaultValue={event?.title} pattern=".*\S.*" required />
        <Field label="Description" name="description" placeholder="Enter event description" defaultValue={event?.description} rows={2} multiline required />
        <Field label="Location" name="location" placeholder="e.g. Community Center A" defaultValue={event?.location} pattern=".*\S.*" required />
        <div className="event-form-dates">
          <Field label="Date" name="date" type="date" defaultValue={event?.date} required />
          <Field label="Start time" name="startTime" type="time" defaultValue={event?.startTime} required />
          <Field label="End time" name="endTime" type="time" defaultValue={event?.endTime} required />
        </div>
        <Field label="Maximum Capacity" name="capacity" type="number" min={Math.max(1, event?.booked ?? 0)} step="1" placeholder="e.g. 100" defaultValue={event?.capacity} required />
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="form-actions"><Button type="submit">{event ? 'Save Changes' : 'Continue'}</Button></div>
      </form>
    </section>
  )
}
