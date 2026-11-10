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
        <p className="demo-note">Use the demo button to open the staff area, or enter sample details and sign in.</p>
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