import { useState } from 'react'
import { Button, Field, PageHeading } from '../components/ui.jsx'
import { referralSources } from '../data/events.js'

function ReferralChart({ rows }) {
  const max = Math.max(5, Math.ceil(Math.max(...rows.map(row => row.count)) / 5) * 5)
  const ticks = Array.from({ length: 6 }, (_, index) => max * (5 - index) / 5)

  return (
    <figure className="referral-chart" aria-label="Registrations by referral source">
      <ul className="chart-legend">
        {rows.map(row => (
          <li key={row.id}><span className="chart-swatch" style={{ backgroundColor: row.color }} />{row.name}</li>
        ))}
      </ul>
      <div className="chart-plot">
        <div className="chart-gridlines" aria-hidden="true">
          {ticks.map(tick => <div key={tick}><span>{tick}</span></div>)}
        </div>
        <div className="chart-bars">
          {rows.map(row => (
            <div key={row.id} className="chart-bar" role="img" aria-label={row.name + ': ' + row.count}
              style={{ '--bar-size': row.count / max * 100 + '%', '--bar-color': row.color }}>
              <span>{row.count}</span>
            </div>
          ))}
        </div>
      </div>
      <figcaption>Registrations by Referral Source</figcaption>
    </figure>
  )
}

export default function ReportsPage({ events, initialEvent }) {
  const [eventId, setEventId] = useState(initialEvent)
  const selected = events.find(event => event.id === eventId)
  const scope = selected ? [selected] : events

  const rows = referralSources.map(source => ({
    ...source,
    count: scope.reduce((total, event) => total + (event.referrals[source.id] ?? 0), 0),
  }))
  const total = rows.reduce((sum, row) => sum + row.count, 0)

  return (
    <section>
      <PageHeading title="Referral Source" description="See how participants found your events." eyebrow="Staff reports">
        <Button to={'/staff/attendance' + (selected ? '?event=' + selected.id : '')}>Attendance</Button>
      </PageHeading>
      <div className="report-filter">
        <Field label="Select event" value={selected?.id ?? ''} onChange={change => setEventId(change.target.value)}
          options={[{ value: '', label: 'All events' }, ...events.map(event => ({ value: event.id, label: event.title }))]} />
      </div>
      <div className="reports-grid">
        <div className="panel chart-panel"><ReferralChart rows={rows} /></div>
        <section className="panel report-summary">
          <h2>Registration totals</h2>
          <dl>
            {rows.map(row => <div key={row.id}><dt>{row.name}</dt><dd>{row.count}</dd></div>)}
          </dl>
          <p className="report-total">Total Registrations <strong>{total}</strong></p>
        </section>
      </div>
    </section>
  )
}
